function fileToBase64(file) { return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(file);}); }

        // Global Application State
        const appState = {
            authenticated: false,
            data: null,
            activeShowIndex: 0,
            pendingUploads: new Map(),
            pendingMediaUploadIndex: -1,
            pendingMediaUploadType: 'image',
            github: {
                owner: 'kaARAss',
                repo: '---',
                branch: 'main',
                token: ''
            }
        };

        // Toast Helper
        function showToast(msg, type = 'success') {
            const toast = document.getElementById('toast');
            const toastMsg = document.getElementById('toast-msg');
            const toastIcon = document.getElementById('toast-icon');
            if (!toast) return;
            toastMsg.textContent = msg;
            toast.className = 'visible toast-' + type;
            toastIcon.textContent = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
            clearTimeout(window._toastTimer);
            window._toastTimer = setTimeout(() => {
                toast.classList.remove('visible');
            }, 4000);
        }


        const DRAFT_KEY = 'tais-site-draft-v1';
        const escapeText = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        let serverAvailable = null;
        let draftTimer;
        let draftQueue = Promise.resolve();
        let savingDraft = false;
        let publishing = false;
        let dirty = false;
        async function jsonRequest(url, options = {}) {
            const response = await fetch(url, { cache: 'no-store', ...options });
            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch { throw new Error('Сервер вернул неверный ответ (' + response.status + ')'); }
            if (!response.ok || data.success === false) throw new Error(data.error || data.message || 'Ошибка HTTP ' + response.status);
            return data;
        }
        async function isServerAvailable() {
            if (serverAvailable !== null) return serverAvailable;
            try {
                const r = await fetch('/api/admin/check-auth', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
                serverAvailable = (r.headers.get('content-type') || '').includes('application/json') && [200,401].includes(r.status);
            } catch { serverAvailable = false; }
            return serverAvailable;
        }
        function setAuthenticated(value) {
            appState.authenticated = value;
            document.getElementById('login-screen').style.display = value ? 'none' : 'flex';
            document.getElementById('dashboard-screen').style.display = value ? 'flex' : 'none';
        }
        async function checkAuth() {
            // Delete insecure legacy browser-side "sessions" and password hashes.
            sessionStorage.removeItem('tais_admin_session');
            localStorage.removeItem('tais_admin_password_hash');
            const user = document.getElementById('username');
            const pass = document.getElementById('password');
            user.removeAttribute('readonly'); pass.removeAttribute('readonly');
            user.autocomplete = 'username'; pass.autocomplete = 'current-password';
            if (await isServerAvailable()) {
                try { await jsonRequest('/api/admin/check-auth'); setAuthenticated(true); await loadData(); return; } catch {}
            } else {
                document.querySelector('label[for="password"]').textContent = 'Личный GitHub-токен';
                pass.placeholder = 'GitHub token: доступ Contents → Read and write';
                user.value = appState.github.owner;
                const note = document.createElement('p');
                note.style.cssText = 'color:#c7bea9;font-size:12px;line-height:1.6;margin:12px 0';
                note.textContent = 'Статический сайт: вход подтверждается через GitHub. Нужен личный токен только для репозитория kaARAss/--- с правом Contents: Read and write. Токен хранится лишь в памяти этой вкладки, не публикуется и не сохраняется в браузере. Старый пароль не защищал доступ к публикации.';
                document.getElementById('login-form').appendChild(note);
                const form = document.getElementById('change-pass-form');
                form.innerHTML = '<p style="line-height:1.7">Доступ к публикации подтверждается GitHub. Пароль и двухфакторную защиту меняйте в настройках GitHub. Для закрытия этой сессии используйте «Выйти». Черновики хранятся только в этом браузере; их можно удалить отдельно.</p><button type="button" id="clear-local-draft" class="btn">Удалить локальный черновик</button>';
                document.getElementById('clear-local-draft').onclick = async () => { if (confirm('Удалить черновик и выбранные файлы из этого браузера?')) { await draftDelete(); showToast('Локальный черновик удалён'); } };
            }
            setAuthenticated(false);
        }
        document.getElementById('login-form').addEventListener('submit', async event => {
            event.preventDefault();
            const button = document.getElementById('btn-login-submit');
            const error = document.getElementById('login-error-msg');
            button.disabled = true; error.style.display = 'none';
            try {
                if (await isServerAvailable()) {
                    await jsonRequest('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:document.getElementById('username').value.trim(),password:document.getElementById('password').value}) });
                } else {
                    const token = document.getElementById('password').value.trim();
                    if (!token) throw new Error('Введите личный GitHub-токен');
                    const headers = {'Authorization':'Bearer ' + token, 'Accept':'application/vnd.github+json'};
                    const repo = await jsonRequest('https://api.github.com/repos/' + appState.github.owner + '/' + appState.github.repo, {headers});
                    if (!repo.permissions || !repo.permissions.push) throw new Error('У этого GitHub-токена нет прав на запись в репозиторий');
                    appState.github.token = token;
                }
                document.getElementById('password').value = '';
                setAuthenticated(true);
                await loadData();
            } catch (err) { appState.github.token = ''; setAuthenticated(false); error.textContent = err.message; error.style.display = 'block'; }
            finally { button.disabled = false; }
        });
        document.getElementById('btn-logout').addEventListener('click', async () => {
            try { if (await isServerAvailable()) await jsonRequest('/api/admin/logout', {method:'POST'}); }
            catch (e) { showToast(e.message,'error'); return; }
            appState.github.token = ''; appState.data = null; setAuthenticated(false); showToast('Сессия закрыта. Черновик сохранён отдельно.');
        });
        function draftDB() {
            return new Promise((resolve,reject) => {
                const r = indexedDB.open('tais-admin',1);
                r.onupgradeneeded = () => r.result.createObjectStore('drafts');
                r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
            });
        }
        async function draftOperation(mode, action) {
            const db = await draftDB();
            try { return await new Promise((resolve,reject) => {
                const tx = db.transaction('drafts',mode); const r = action(tx.objectStore('drafts'));
                tx.oncomplete = () => resolve(r.result); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('Не удалось сохранить черновик'));
            }); } finally { db.close(); }
        }
        const draftRead = () => draftOperation('readonly',store => store.get(DRAFT_KEY));
        const draftDelete = () => draftOperation('readwrite',store => store.delete(DRAFT_KEY));
        async function persistDraft(force = false) {
            if (!appState.data || (publishing && !force)) return;
            saveCurrentShowFormToState(); saveContactsFromForm();
            const data = TaisContent.validate(appState.data);
            const snapshot = {data,files:[...appState.pendingUploads.entries()],baseContent:appState.baseContent,savedAt:Date.now()};
            draftQueue = draftQueue.catch(()=>{}).then(()=>draftOperation('readwrite',store => store.put(snapshot,DRAFT_KEY)));
            await draftQueue;
            dirty = false;
        }
        async function awaitDraftSave() {
            try { await persistDraft(); showToast('Черновик и файлы сохранены в этом браузере. Для сайта нажмите «Опубликовать».'); }
            catch(e) { showToast('Черновик не сохранён: ' + e.message,'error'); }
        }
        function scheduleDraft() {
            if (!appState.authenticated || !appState.data || appState.loading || publishing) return;
            dirty = true; clearTimeout(draftTimer);
            draftTimer = setTimeout(() => persistDraft().catch(e => showToast('Автосохранение не удалось: ' + e.message,'error')),500);
        }
        ['input','change','click'].forEach(type => document.getElementById('dashboard-screen').addEventListener(type,scheduleDraft));
        window.addEventListener('beforeunload', e => { if (dirty || publishing) { e.preventDefault(); e.returnValue=''; } });
        async function verifyUpload(file, kind) {
            if (!file.size || file.size > 95*1024*1024) throw new Error('Файл должен быть непустым и меньше 95 МБ');
            const b = new Uint8Array(await file.slice(0,32).arrayBuffer());
            const text = new TextDecoder('latin1').decode(b);
            const image = (b[0]===137&&text.slice(1,4)==='PNG') || (b[0]===255&&b[1]===216&&b[2]===255) || text.startsWith('GIF8') || (text.startsWith('RIFF')&&text.slice(8,12)==='WEBP') || (text.slice(4,8)==='ftyp'&&/avif|avis/.test(text));
            const video = (text.slice(4,8)==='ftyp'&&!/avif|avis/.test(text)) || (b[0]===26&&b[1]===69&&b[2]===223&&b[3]===163);
            if (kind==='video' ? !video || !/\.(mp4|webm|mov|m4v)$/i.test(file.name) : !image || !/\.(png|jpe?g|webp|gif|avif)$/i.test(file.name)) throw new Error(kind==='video' ? 'Выберите настоящее видео MP4/WebM/MOV, не фотографию' : 'Выберите изображение PNG/JPG/WebP/GIF/AVIF');
        }

        // Tab Switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                const target = document.getElementById(tabId);
                if (target) target.classList.add('active');
            });
        });


        async function loadData() {
            appState.loading = true;
            document.getElementById('dashboard-screen').inert = true;
            try {
                let data;
                if (await isServerAvailable()) data = (await jsonRequest('/api/admin/data')).data;
                else {
                    const r = await fetch('/index.html?v=' + Date.now(),{cache:'no-store'});
                    if (!r.ok) throw new Error('Не удалось загрузить сайт: ' + r.status);
                    data = TaisContent.read(await r.text());
                }
                appState.data = TaisContent.validate(data);
                appState.baseContent = TaisContent.stringify(appState.data);
                const draft = await draftRead();
                if (draft && confirm('В этом браузере есть черновик от ' + new Date(draft.savedAt).toLocaleString('ru-RU') + '. Восстановить его вместе с выбранными файлами?')) {
                    appState.data = TaisContent.validate(draft.data);
                    appState.baseContent = draft.baseContent;
                    appState.pendingUploads = new Map(draft.files || []);
                    for (const show of appState.data.monthsData) for (const item of show.media) {
                        const file = appState.pendingUploads.get(item.url.replace(/^\.\//,''));
                        if (file) item._blobPreview = URL.createObjectURL(file);
                    }
                }
                renderShowsSelector(); renderSelectedShow(appState.activeShowIndex); renderContactsTab();
                document.getElementById('banner-preview-img').src = appState.data.banner.desktopImage;
                document.getElementById('banner-mobile-preview-img').src = appState.data.banner.mobileImage;
                showToast('Данные загружены. Сохранение черновика и публикация — отдельные действия.');
            } catch(err) { showToast('Ошибка загрузки: ' + err.message,'error'); throw err; }
            finally { appState.loading = false; document.getElementById('dashboard-screen').inert = false; }
        }

        // Render Shows Pills Grid
        function renderShowsSelector() {
            const container = document.getElementById('shows-selector');
            if (!container) return;
            container.innerHTML = '';
            const shows = appState.data?.monthsData || [];

            shows.forEach((show, index) => {
                const pill = document.createElement('div');
                pill.className = 'show-pill' + (index === appState.activeShowIndex ? ' active' : '');
                const imagePath = (show.image || ('./show' + (index + 1) + '.png')).split('?')[0];
                const localFile = appState.pendingUploads.get(imagePath.replace(/^\.\//,''));
                const cleanImg = localFile ? URL.createObjectURL(localFile) : show.image;
                pill.innerHTML = `
                    <img src="${cleanImg}" alt="Шоу ${index + 1}" class="show-pill-thumb">
                    <div class="show-pill-num">#${index + 1}</div>
                    <div class="show-pill-title">${escapeText(show.title || ('Шоу ' + (index + 1)))}</div>
                `;
                pill.addEventListener('click', () => {
                    saveCurrentShowFormToState();
                    appState.activeShowIndex = index;
                    renderShowsSelector();
                    renderSelectedShow(index);
                });
                container.appendChild(pill);
            });
        }

        // Clean system HTML tags to plain text for admin editor
        function detailsHtmlToPlainText(html) {
            if (!html) return '';
            let text = html;
            // Remove system header <h3 ...>О шоу</h3>
            text = text.replace(/<h3[^>]*>[\s\S]*?<\/h3>/gi, '');
            // Convert list items
            text = text.replace(/<li[^>]*>/gi, '• ');
            text = text.replace(/<\/li>/gi, '\n');
            text = text.replace(/<\/(ul|ol)>/gi, '\n');
            // Convert paragraphs and breaks
            text = text.replace(/<br\s*\/?>/gi, '\n');
            text = text.replace(/<\/p>/gi, '\n\n');
            // Remove remaining HTML tags
            text = text.replace(/<[^>]+>/g, '');
            // Decode HTML entities
            text = text.replace(/&nbsp;/g, ' ')
                       .replace(/&amp;/g, '&')
                       .replace(/&quot;/g, '"')
                       .replace(/&lt;/g, '<')
                       .replace(/&gt;/g, '>');
            // Normalize spacing
            text = text.replace(/\r\n/g, '\n').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
            return text;
        }

        // Convert plain text back to standardized fixed HTML for site (both PC and mobile)
        function plainTextToDetailsHtml(plainText) {
            if (!plainText || !plainText.trim()) return '';
            const clean = plainText.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const rawParagraphs = clean.split(/\n\s*\n/);
            let html = '<h3 style="color: #f8e7bc; margin-top: 0; font-size: 22px; font-weight: 500;">О шоу</h3>\n';
            
            for (const para of rawParagraphs) {
                const trimmed = para.trim();
                if (!trimmed) continue;
                
                if (trimmed.includes('• ') || trimmed.startsWith('- ')) {
                    const lines = trimmed.split('\n');
                    let listHtml = '<ul style="margin-top: 0; margin-bottom: 15px; padding-left: 20px; line-height: 1.6;">\n';
                    let nonListLines = [];
                    
                    for (const line of lines) {
                        const l = line.trim();
                        if (l.startsWith('• ') || l.startsWith('- ')) {
                            const itemText = l.replace(/^[•\-]\s*/, '');
                            listHtml += `    <li>${itemText}</li>\n`;
                        } else if (l) {
                            nonListLines.push(l);
                        }
                    }
                    listHtml += '</ul>\n';
                    if (nonListLines.length > 0) {
                        html += `<p style="margin-bottom: 8px; font-weight: 600; color: #f8e7bc;">${nonListLines.join('<br>')}</p>\n`;
                    }
                    html += listHtml;
                } else {
                    const formatted = trimmed.replace(/\n/g, '<br>');
                    html += `<p style="margin-bottom: 15px; line-height: 1.6;">${formatted}</p>\n`;
                }
            }
            return html;
        }

        function saveCurrentShowFormToState() {
            const shows = appState.data?.monthsData;
            if (!shows || !shows[appState.activeShowIndex]) return;
            const curr = shows[appState.activeShowIndex];
            const titleInput = document.getElementById('show-title-input');
            const dateInput = document.getElementById('show-date-input');
            const detailsInput = document.getElementById('show-details-input');
            if (titleInput) curr.title = titleInput.value.trim();
            if (dateInput) curr.event_date = dateInput.value.trim();
            if (detailsInput && detailsInput.value !== detailsHtmlToPlainText(curr.detailsText || '')) {
                curr.detailsText = plainTextToDetailsHtml(detailsInput.value);
            }
        }

        // Parse CSS position string to numeric X and Y percentages (0-100)
        function parsePositionToXY(str) {
            if (!str || typeof str !== 'string') return { x: 50, y: 50 };
            let x = 50, y = 50;
            const parts = str.trim().split(/\s+/);
            if (parts[0] === 'left') x = 0;
            else if (parts[0] === 'right') x = 100;
            else if (parts[0] === 'center') x = 50;
            else if (parts[0].endsWith('%')) x = parseFloat(parts[0]);
            else if (!isNaN(parseFloat(parts[0]))) x = parseFloat(parts[0]);

            if (parts[1]) {
                if (parts[1] === 'top') y = 0;
                else if (parts[1] === 'bottom') y = 100;
                else if (parts[1] === 'center') y = 50;
                else if (parts[1].endsWith('%')) y = parseFloat(parts[1]);
                else if (!isNaN(parseFloat(parts[1]))) y = parseFloat(parts[1]);
            } else {
                if (parts[0] === 'top') { y = 0; x = 50; }
                else if (parts[0] === 'bottom') { y = 100; x = 50; }
            }
            return {
                x: Math.max(0, Math.min(100, Math.round(x))),
                y: Math.max(0, Math.min(100, Math.round(y)))
            };
        }

        // Active Show Photo Transform State
        let photoCurrentX = 50;
        let photoCurrentY = 50;
        let photoCurrentScale = 1.0;
        let isDraggingPhoto = false;
        let photoDragStartX = 0;
        let photoDragStartY = 0;
        let photoInitialX = 50;
        let photoInitialY = 50;

        // Card replacement mode
        let isCardModeUnified = true;
        let isPreviewingMobileCard = false;

        function updatePhotoTransformUI(x, y, scale, saveToState = true) {
            photoCurrentX = x;
            photoCurrentY = y;
            photoCurrentScale = scale;

            const previewImg = document.getElementById('preview-card-img');
            const badge = document.getElementById('preview-coords-badge');
            const sliderX = document.getElementById('card-pos-x-slider');
            const sliderY = document.getElementById('card-pos-y-slider');
            const labelX = document.getElementById('pos-x-label');
            const labelY = document.getElementById('pos-y-label');
            const scaleSlider = document.getElementById('card-scale-slider');
            const scaleLabel = document.getElementById('scale-value-label');
            const customPosInput = document.getElementById('pos-custom-input');

            const posStr = x + '% ' + y + '%';

            if (previewImg) {
                previewImg.style.objectPosition = posStr;
                previewImg.style.transformOrigin = posStr;
                previewImg.style.transform = scale !== 1 ? ('scale(' + scale + ')') : 'none';
            }

            const scalePercent = Math.round(scale * 100);
            if (badge) badge.textContent = 'X: ' + x + '% · Y: ' + y + '% · Масштаб: ' + scalePercent + '%';
            if (sliderX) sliderX.value = x;
            if (sliderY) sliderY.value = y;
            if (labelX) labelX.textContent = x + '%';
            if (labelY) labelY.textContent = y + '%';
            if (scaleSlider) scaleSlider.value = scalePercent;
            if (scaleLabel) scaleLabel.textContent = scalePercent + '%';
            if (customPosInput) customPosInput.value = posStr;

            // Highlight active preset chip if match
            document.querySelectorAll('.pos-chip-btn:not(.gold-preset-btn)').forEach(btn => {
                const preset = btn.getAttribute('data-preset');
                const p = parsePositionToXY(preset);
                btn.classList.toggle('active', p.x === x && p.y === y);
            });

            if (saveToState && appState.data) {
                const idx = appState.activeShowIndex;
                if (!appState.data.showPosMap) appState.data.showPosMap = {};
                appState.data.showPosMap[idx + 1] = {
                    pos: posStr,
                    scale: scale
                };
            }
        }

        function updateCardPreviewImage(show) {
            if (!show) show = appState.data?.monthsData?.[appState.activeShowIndex];
            if (!show) return;
            const previewImg = document.getElementById('preview-card-img');
            const badge = document.getElementById('preview-card-subtitle-badge');
            
            const rawUrl = (isPreviewingMobileCard && show.mobileImage) ? show.mobileImage : (show.image || ('./show' + (appState.activeShowIndex + 1) + '.png'));
            const pendingPath = (rawUrl || '').split('?')[0].replace(/^\.\//, '');
            const pendingFile = appState.pendingUploads.get(pendingPath);
            const cleanUrl = pendingFile ? URL.createObjectURL(pendingFile) : rawUrl;
            if (previewImg) previewImg.src = cleanUrl;
            if (badge) {
                badge.textContent = isPreviewingMobileCard ? 'Вид для телефона (Mobile)' : 'Вид для ПК (Desktop)';
            }
            document.getElementById('preview-card-title').textContent = show.title || ('Шоу ' + (appState.activeShowIndex + 1));
        }

        // Render Show Editor Form
        function renderSelectedShow(index) {
            const shows = appState.data?.monthsData || [];
            const show = shows[index];
            if (!show) return;

            document.getElementById('active-show-title').textContent = 'Шоу #' + (index + 1) + ': ' + (show.title || '');
            document.getElementById('show-title-input').value = show.title || '';
            document.getElementById('show-date-input').value = show.event_date || '';
            document.getElementById('show-details-input').value = detailsHtmlToPlainText(show.detailsText || '');

            // Card preview
            updateCardPreviewImage(show);

            // Position & Scale mapping
            const currentEntry = (appState.data.showPosMap && appState.data.showPosMap[index + 1]) || 'left center';
            const currentPosStr = typeof currentEntry === 'string' ? currentEntry : (currentEntry.pos || 'left center');
            const currentScale = (typeof currentEntry === 'object' && currentEntry && currentEntry.scale) ? currentEntry.scale : 1.0;

            const xy = parsePositionToXY(currentPosStr);
            updatePhotoTransformUI(xy.x, xy.y, currentScale, false);

            // Render media items
            renderShowMediaGrid(show);
        }

        // Setup Interactive Photo Dragging and Wheel Zoom
        const photoFrame = document.getElementById('card-preview-container');
        if (photoFrame) {
            photoFrame.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return; // Only Left Mouse Button
                e.preventDefault();
                isDraggingPhoto = true;
                photoFrame.classList.add('is-dragging');
                photoDragStartX = e.clientX;
                photoDragStartY = e.clientY;
                photoInitialX = photoCurrentX;
                photoInitialY = photoCurrentY;
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDraggingPhoto) return;
                const rect = photoFrame.getBoundingClientRect();
                const dx = e.clientX - photoDragStartX;
                const dy = e.clientY - photoDragStartY;

                const deltaXPercent = (dx / rect.width) * 100;
                const deltaYPercent = (dy / rect.height) * 100;

                let newX = Math.round(photoInitialX - deltaXPercent);
                let newY = Math.round(photoInitialY - deltaYPercent);
                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                updatePhotoTransformUI(newX, newY, photoCurrentScale, true);
            });

            window.addEventListener('mouseup', () => {
                if (isDraggingPhoto) {
                    isDraggingPhoto = false;
                    photoFrame.classList.remove('is-dragging');
                }
            });

            // Touch support for dragging photo on mobile
            photoFrame.addEventListener('touchstart', (e) => {
                if (!e.touches || e.touches.length !== 1) return;
                isDraggingPhoto = true;
                photoFrame.classList.add('is-dragging');
                photoDragStartX = e.touches[0].clientX;
                photoDragStartY = e.touches[0].clientY;
                photoInitialX = photoCurrentX;
                photoInitialY = photoCurrentY;
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (!isDraggingPhoto || !e.touches || e.touches.length !== 1) return;
                const rect = photoFrame.getBoundingClientRect();
                const dx = e.touches[0].clientX - photoDragStartX;
                const dy = e.touches[0].clientY - photoDragStartY;

                const deltaXPercent = (dx / rect.width) * 100;
                const deltaYPercent = (dy / rect.height) * 100;

                let newX = Math.round(photoInitialX - deltaXPercent);
                let newY = Math.round(photoInitialY - deltaYPercent);
                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                updatePhotoTransformUI(newX, newY, photoCurrentScale, true);
                if (e.cancelable) e.preventDefault();
            }, { passive: false });

            window.addEventListener('touchend', () => {
                if (isDraggingPhoto) {
                    isDraggingPhoto = false;
                    photoFrame.classList.remove('is-dragging');
                }
            });

            // Wheel zoom directly over photo
            photoFrame.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY < 0 ? 0.05 : -0.05;
                let newScale = Math.round((photoCurrentScale + delta) * 100) / 100;
                newScale = Math.max(1.0, Math.min(2.5, newScale));
                updatePhotoTransformUI(photoCurrentX, photoCurrentY, newScale, true);
            }, { passive: false });
        }

        // Scale controls wiring
        const scaleSlider = document.getElementById('card-scale-slider');
        if (scaleSlider) {
            scaleSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) / 100;
                updatePhotoTransformUI(photoCurrentX, photoCurrentY, val, true);
            });
        }
        document.getElementById('btn-scale-down').addEventListener('click', () => {
            const newScale = Math.max(1.0, Math.round((photoCurrentScale - 0.05) * 100) / 100);
            updatePhotoTransformUI(photoCurrentX, photoCurrentY, newScale, true);
        });
        document.getElementById('btn-scale-up').addEventListener('click', () => {
            const newScale = Math.min(2.5, Math.round((photoCurrentScale + 0.05) * 100) / 100);
            updatePhotoTransformUI(photoCurrentX, photoCurrentY, newScale, true);
        });
        document.getElementById('btn-scale-reset').addEventListener('click', () => {
            updatePhotoTransformUI(photoCurrentX, photoCurrentY, 1.0, true);
        });

        // Position sliders wiring
        const posXSlider = document.getElementById('card-pos-x-slider');
        const posYSlider = document.getElementById('card-pos-y-slider');
        if (posXSlider) {
            posXSlider.addEventListener('input', (e) => {
                updatePhotoTransformUI(parseInt(e.target.value, 10), photoCurrentY, photoCurrentScale, true);
            });
        }
        if (posYSlider) {
            posYSlider.addEventListener('input', (e) => {
                updatePhotoTransformUI(photoCurrentX, parseInt(e.target.value, 10), photoCurrentScale, true);
            });
        }
        document.getElementById('btn-center-pos').addEventListener('click', () => {
            updatePhotoTransformUI(50, 50, photoCurrentScale, true);
        });

        // Position preset chips
        document.querySelectorAll('.pos-chip-btn:not(.gold-preset-btn)').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.getAttribute('data-preset');
                const xy = parsePositionToXY(preset);
                updatePhotoTransformUI(xy.x, xy.y, photoCurrentScale, true);
            });
        });

        // ==============================================
        // GOLD FRAME INTERACTIVE MODAL FOR BOTTOM MEDIA
        // ==============================================
        let activeGoldItem = null;
        let goldCurrentX = 50;
        let goldCurrentY = 50;
        let goldCurrentScale = 1.0;
        let isDraggingGold = false;
        let goldDragStartX = 0;
        let goldDragStartY = 0;
        let goldInitialX = 50;
        let goldInitialY = 50;

        function openGoldFrameModal(item, showTitle) {
            activeGoldItem = item;
            const modal = document.getElementById('modal-photo-frame-adjust');
            const titleEl = document.getElementById('gold-modal-title');
            const targetImg = document.getElementById('gold-frame-target-img');
            
            if (titleEl) titleEl.textContent = 'Положение в рамке: ' + (item.label || showTitle || 'Фото');
            const imgSrc = item._blobPreview || item.url || '';
            if (targetImg) targetImg.src = imgSrc;

            const xy = parsePositionToXY(item.pos || '50% 50%');
            const scale = (typeof item.scale === 'number') ? item.scale : 1.0;
            updateGoldTransformUI(xy.x, xy.y, scale);

            if (modal) modal.classList.add('is-open');
        }

        function closeGoldFrameModal() {
            const modal = document.getElementById('modal-photo-frame-adjust');
            if (modal) modal.classList.remove('is-open');
            activeGoldItem = null;
        }

        function updateGoldTransformUI(x, y, scale) {
            goldCurrentX = x;
            goldCurrentY = y;
            goldCurrentScale = scale;

            const targetImg = document.getElementById('gold-frame-target-img');
            const badge = document.getElementById('gold-frame-coords-badge');
            const scaleSlider = document.getElementById('gold-scale-slider');
            const scaleLabel = document.getElementById('gold-scale-label');

            const posStr = x + '% ' + y + '%';
            if (targetImg) {
                targetImg.style.objectPosition = posStr;
                targetImg.style.transformOrigin = posStr;
                targetImg.style.transform = scale !== 1 ? ('scale(' + scale + ')') : 'none';
            }

            const scalePercent = Math.round(scale * 100);
            if (badge) badge.textContent = 'X: ' + x + '% · Y: ' + y + '% · Масштаб: ' + scalePercent + '%';
            if (scaleSlider) scaleSlider.value = scalePercent;
            if (scaleLabel) scaleLabel.textContent = scalePercent + '%';

            document.querySelectorAll('.gold-preset-btn').forEach(btn => {
                const preset = btn.getAttribute('data-preset');
                const p = parsePositionToXY(preset);
                btn.classList.toggle('active', p.x === x && p.y === y);
            });
        }

        const goldBox = document.getElementById('gold-frame-interactive-box');
        if (goldBox) {
            goldBox.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                isDraggingGold = true;
                goldBox.style.cursor = 'grabbing';
                goldDragStartX = e.clientX;
                goldDragStartY = e.clientY;
                goldInitialX = goldCurrentX;
                goldInitialY = goldCurrentY;
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDraggingGold) return;
                const rect = goldBox.getBoundingClientRect();
                const dx = e.clientX - goldDragStartX;
                const dy = e.clientY - goldDragStartY;

                const deltaXPercent = (dx / rect.width) * 100;
                const deltaYPercent = (dy / rect.height) * 100;

                let newX = Math.round(goldInitialX - deltaXPercent);
                let newY = Math.round(goldInitialY - deltaYPercent);
                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                updateGoldTransformUI(newX, newY, goldCurrentScale);
            });

            window.addEventListener('mouseup', () => {
                if (isDraggingGold) {
                    isDraggingGold = false;
                    goldBox.style.cursor = 'grab';
                }
            });

            // Touch support for dragging photo in gold modal on mobile
            goldBox.addEventListener('touchstart', (e) => {
                if (!e.touches || e.touches.length !== 1) return;
                isDraggingGold = true;
                goldBox.style.cursor = 'grabbing';
                goldDragStartX = e.touches[0].clientX;
                goldDragStartY = e.touches[0].clientY;
                goldInitialX = goldCurrentX;
                goldInitialY = goldCurrentY;
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (!isDraggingGold || !e.touches || e.touches.length !== 1) return;
                const rect = goldBox.getBoundingClientRect();
                const dx = e.touches[0].clientX - goldDragStartX;
                const dy = e.touches[0].clientY - goldDragStartY;

                const deltaXPercent = (dx / rect.width) * 100;
                const deltaYPercent = (dy / rect.height) * 100;

                let newX = Math.round(goldInitialX - deltaXPercent);
                let newY = Math.round(goldInitialY - deltaYPercent);
                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                updateGoldTransformUI(newX, newY, goldCurrentScale);
                if (e.cancelable) e.preventDefault();
            }, { passive: false });

            window.addEventListener('touchend', () => {
                if (isDraggingGold) {
                    isDraggingGold = false;
                    goldBox.style.cursor = 'grab';
                }
            });

            goldBox.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY < 0 ? 0.05 : -0.05;
                let newScale = Math.round((goldCurrentScale + delta) * 100) / 100;
                newScale = Math.max(1.0, Math.min(2.5, newScale));
                updateGoldTransformUI(goldCurrentX, goldCurrentY, newScale);
            }, { passive: false });
        }

        document.getElementById('btn-gold-scale-down')?.addEventListener('click', () => {
            const newScale = Math.max(1.0, Math.round((goldCurrentScale - 0.05) * 100) / 100);
            updateGoldTransformUI(goldCurrentX, goldCurrentY, newScale);
        });
        document.getElementById('btn-gold-scale-up')?.addEventListener('click', () => {
            const newScale = Math.min(2.5, Math.round((goldCurrentScale + 0.05) * 100) / 100);
            updateGoldTransformUI(goldCurrentX, goldCurrentY, newScale);
        });
        document.getElementById('btn-gold-scale-reset')?.addEventListener('click', () => {
            updateGoldTransformUI(goldCurrentX, goldCurrentY, 1.0);
        });
        document.getElementById('gold-scale-slider')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) / 100;
            updateGoldTransformUI(goldCurrentX, goldCurrentY, val);
        });
        document.querySelectorAll('.gold-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.getAttribute('data-preset');
                const xy = parsePositionToXY(preset);
                updateGoldTransformUI(xy.x, xy.y, goldCurrentScale);
            });
        });

        document.getElementById('btn-close-gold-modal')?.addEventListener('click', closeGoldFrameModal);
        document.getElementById('btn-cancel-gold-modal')?.addEventListener('click', closeGoldFrameModal);
        document.getElementById('btn-save-gold-modal')?.addEventListener('click', () => {
            if (activeGoldItem) {
                activeGoldItem.pos = goldCurrentX + '% ' + goldCurrentY + '%';
                activeGoldItem.scale = goldCurrentScale;
                const show = appState.data?.monthsData?.[appState.activeShowIndex];
                if (show) renderShowMediaGrid(show);
                showToast('✓ Положение фото в рамке сохранено!');
            }
            closeGoldFrameModal();
        });

        // Photo replacement mode tumbler handlers
        const btnToggleUnified = document.getElementById('btn-toggle-unified');
        const btnToggleSeparate = document.getElementById('btn-toggle-separate');
        const hintEl = document.getElementById('photo-mode-hint');
        const wrapUnified = document.getElementById('photo-upload-unified-wrap');
        const wrapSeparate = document.getElementById('photo-upload-separate-wrap');

        if (btnToggleUnified && btnToggleSeparate) {
            btnToggleUnified.addEventListener('click', () => {
                isCardModeUnified = true;
                btnToggleUnified.classList.add('active');
                btnToggleSeparate.classList.remove('active');
                if (hintEl) hintEl.textContent = 'Одинаковое фото: при замене обновляется и на ПК, и на телефоне';
                if (wrapUnified) wrapUnified.style.display = 'block';
                if (wrapSeparate) wrapSeparate.style.display = 'none';
                isPreviewingMobileCard = false;
                updateCardPreviewImage();
            });

            btnToggleSeparate.addEventListener('click', () => {
                isCardModeUnified = false;
                btnToggleSeparate.classList.add('active');
                btnToggleUnified.classList.remove('active');
                if (hintEl) hintEl.textContent = 'Раздельные фото: вы можете загрузить разные кадры для ПК и телефона';
                if (wrapUnified) wrapUnified.style.display = 'none';
                if (wrapSeparate) wrapSeparate.style.display = 'block';
                updateCardPreviewImage();
            });
        }

        const btnPrevPc = document.getElementById('btn-preview-pc-card');
        const btnPrevMob = document.getElementById('btn-preview-mobile-card');
        if (btnPrevPc) {
            btnPrevPc.addEventListener('click', () => {
                isPreviewingMobileCard = false;
                updateCardPreviewImage();
            });
        }
        if (btnPrevMob) {
            btnPrevMob.addEventListener('click', () => {
                isPreviewingMobileCard = true;
                updateCardPreviewImage();
            });
        }

        // Render Media Items Grid, Side Materials List, and Live Rail for selected show
        function renderShowMediaGrid(show) {
            const grid = document.getElementById('current-show-media-grid');
            const sideList = document.getElementById('side-materials-scroll-list');
            const sideCount = document.getElementById('side-materials-count');
            const railContainer = document.getElementById('card-preview-materials-rail');

            const items = show.media || [];
            if (sideCount) sideCount.textContent = items.length + ' ' + (items.length === 1 ? 'файл' : (items.length > 1 && items.length < 5 ? 'файла' : 'файлов'));

            // 0. Render Live Card Materials Rail (right beside card preview)
            if (railContainer) {
                railContainer.innerHTML = '';
                if (items.length === 0) {
                    railContainer.style.display = 'none';
                } else {
                    railContainer.style.display = 'flex';
                    items.forEach((item, idx) => {
                        const isVideo = item.type === 'video';
                        const rawThumb = (!isVideo && item._blobPreview) || item.poster || (isVideo ? show.image : item.url);
                        const pendingThumb = appState.pendingUploads.get((rawThumb || '').split('?')[0].replace(/^\.\//,''));
                        const thumbSrc = pendingThumb && !/^video\//.test(pendingThumb.type) ? URL.createObjectURL(pendingThumb) : rawThumb;
                        const posStr = item.pos || 'center';

                        const railItem = document.createElement('div');
                        railItem.className = 'rail-thumb-item';
                        railItem.title = (item.label || (isVideo ? 'Видео ' + (idx + 1) : 'Фото ' + (idx + 1))) + ' (нажмите для настройки)';
                        railItem.innerHTML = `
                            <img src="${thumbSrc}" alt="" style="object-position: ${posStr};">
                            ${isVideo ? '<span style="position: absolute; bottom: 2px; left: 4px; font-size: 10px; color: #f8e7bc; text-shadow: 0 1px 4px #000;">▶</span>' : ''}
                            <button type="button" class="rail-thumb-del" data-index="${idx}" title="Удалить из карточки">✕</button>
                        `;
                        railItem.querySelector('.rail-thumb-del').addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (confirm('Удалить ' + (item.label || 'элемент') + ' из карточки?')) {
                                items.splice(idx, 1);
                                renderShowMediaGrid(show);
                                showToast('Элемент удалён');
                            }
                        });
                        railItem.addEventListener('click', () => {
                            if (!isVideo) {
                                openGoldFrameModal(item, show.title);
                            }
                        });
                        railContainer.appendChild(railItem);
                    });
                }
            }

            // 1. Render Side Materials Scroll List (inside card preview section)
            if (sideList) {
                sideList.innerHTML = '';
                if (items.length === 0) {
                    sideList.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; padding: 12px; text-align: center; border: 1px dashed var(--border-subtle); border-radius: 8px;">В карточке ещё нет медиафайлов.<br>Нажмите «+ Фото» или «+ Видео», чтобы добавить</div>';
                } else {
                    items.forEach((item, idx) => {
                        const isVideo = item.type === 'video';
                        const rawThumb = (!isVideo && item._blobPreview) || item.poster || (isVideo ? show.image : item.url);
                        const pendingThumb = appState.pendingUploads.get((rawThumb || '').split('?')[0].replace(/^\.\//,''));
                        const thumbSrc = pendingThumb && !/^video\//.test(pendingThumb.type) ? URL.createObjectURL(pendingThumb) : rawThumb;
                        const posStr = item.pos || 'center';

                        const sideItem = document.createElement('div');
                        sideItem.className = 'side-material-item';
                        sideItem.innerHTML = `
                            <img src="${thumbSrc}" alt="" class="side-material-thumb" style="object-position: ${posStr};">
                            <div class="side-material-info">
                                <div class="side-material-title">${escapeText(item.label || (isVideo ? 'Видео ' + (idx + 1) : 'Фото ' + (idx + 1)))}</div>
                                <div class="side-material-badge">${isVideo ? '▶ Видео (.mp4)' : '📷 Фото'}</div>
                            </div>
                            ${!isVideo ? `
                                <button type="button" class="btn btn-secondary btn-side-adjust" data-index="${idx}" style="padding: 5px 8px; font-size: 11px;" title="Положение в рамке">
                                    🎯
                                </button>
                            ` : ''}
                            <button type="button" class="side-material-del-btn btn-side-delete" data-index="${idx}" title="Удалить из карточки">✕</button>
                        `;

                        const adjBtn = sideItem.querySelector('.btn-side-adjust');
                        if (adjBtn) {
                            adjBtn.addEventListener('click', () => {
                                openGoldFrameModal(item, show.title);
                            });
                        }

                        sideItem.querySelector('.btn-side-delete').addEventListener('click', () => {
                            if (confirm('Удалить ' + (item.label || 'элемент') + ' из карточки?')) {
                                items.splice(idx, 1);
                                renderShowMediaGrid(show);
                                showToast('Элемент удалён из карточки');
                            }
                        });

                        sideList.appendChild(sideItem);
                    });
                }
            }

            // 2. Render Bottom Media Grid
            if (!grid) return;
            grid.innerHTML = '';
            if (items.length === 0) {
                grid.innerHTML = '<div style="color: var(--text-muted); font-size: 14px;">Медиафайлы ещё не добавлены</div>';
                return;
            }

            items.forEach((item, idx) => {
                const card = document.createElement('div');
                card.className = 'media-card';
                const isVideo = item.type === 'video';
                const rawThumb = (!isVideo && item._blobPreview) || item.poster || (isVideo ? show.image : item.url);
                        const pendingThumb = appState.pendingUploads.get((rawThumb || '').split('?')[0].replace(/^\.\//,''));
                        const thumbSrc = pendingThumb && !/^video\//.test(pendingThumb.type) ? URL.createObjectURL(pendingThumb) : rawThumb;
                const posStr = item.pos || 'center';

                card.innerHTML = `
                    <div class="media-thumb-wrap">
                        <img src="${thumbSrc}" alt="${escapeText(item.label || '')}" class="media-thumb" style="object-position: ${posStr};">
                        <span class="media-badge">${isVideo ? '▶ Видео' : '📷 Фото'}</span>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" class="form-input media-label-input" value="${escapeText(item.label || '')}" style="padding: 6px 10px; font-size: 13px;" placeholder="Подпись">
                    </div>
                    <div class="media-actions">
                        ${!isVideo ? `
                            <button type="button" class="btn btn-secondary btn-block btn-adjust-gold-frame" data-index="${idx}" style="padding: 6px 10px; font-size: 12px; background: rgba(248, 231, 188, 0.12); color: var(--gold); border-color: rgba(248, 231, 188, 0.35); margin-bottom: 6px;">
                                🎯 Положение в рамке (ЛКМ)
                            </button>
                        ` : ''}
                        <div style="display: flex; gap: 6px; width: 100%;">
                            <button type="button" class="btn btn-secondary btn-replace-media" data-index="${idx}" style="flex: 1; padding: 7px 10px; font-size: 12px;">
                                🔄 Заменить
                            </button>
                            <button type="button" class="btn btn-danger btn-delete-media" data-index="${idx}" style="padding: 7px 10px; font-size: 12px;">
                                ✕
                            </button>
                        </div>
                    </div>
                `;

                // Update label on change
                const labelInput = card.querySelector('.media-label-input');
                labelInput.addEventListener('change', (e) => {
                    item.label = e.target.value;
                    renderShowMediaGrid(show);
                });

                // Adjust position in gold frame
                const adjustBtn = card.querySelector('.btn-adjust-gold-frame');
                if (adjustBtn) {
                    adjustBtn.addEventListener('click', () => {
                        openGoldFrameModal(item, show.title);
                    });
                }

                // Replace file
                card.querySelector('.btn-replace-media').addEventListener('click', () => {
                    appState.pendingMediaUploadIndex = idx;
                    appState.pendingMediaUploadType = item.type;
                    document.getElementById('upload-media-item-file').click();
                });

                // Delete media
                card.querySelector('.btn-delete-media').addEventListener('click', () => {
                    if (confirm('Удалить ' + (item.label || 'элемент') + '?')) {
                        items.splice(idx, 1);
                        renderShowMediaGrid(show);
                    }
                });

                grid.appendChild(card);
            });
        }

        // Upload new Card Image handlers
        document.getElementById('btn-upload-card-img')?.addEventListener('click', () => {
            document.getElementById('upload-card-file').click();
        });
        document.getElementById('btn-upload-pc-card-img')?.addEventListener('click', () => {
            document.getElementById('upload-card-file').click();
        });
        document.getElementById('btn-upload-mobile-card-img')?.addEventListener('click', () => {
            document.getElementById('upload-card-mobile-file').click();
        });

        document.getElementById('upload-card-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try { await verifyUpload(file, e.target.id === 'upload-media-item-file' ? appState.pendingMediaUploadType : 'image'); } catch (err) { showToast(err.message, 'error'); e.target.value = ''; return; }
            const idx = appState.activeShowIndex;
            const shows = appState.data.monthsData;
            const targetFileName = 'show' + (idx + 1) + '_' + Date.now() + '.' + file.name.split('.').pop().toLowerCase();
            const previewBlobUrl = URL.createObjectURL(file);

            shows[idx].image = './' + targetFileName;
            if (isCardModeUnified) {
                shows[idx].mobileImage = './' + targetFileName;
            }
            document.getElementById('preview-card-img').src = previewBlobUrl;

            if (!appState.pendingUploads) appState.pendingUploads = new Map();
            appState.pendingUploads.set(targetFileName, file);

            renderShowsSelector();
            showToast(isCardModeUnified ? '✓ Главное фото для ПК и Телефона выбрано!' : '✓ Фото карточки для ПК выбрано!');
            e.target.value = '';
        });

        document.getElementById('upload-card-mobile-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try { await verifyUpload(file, e.target.id === 'upload-media-item-file' ? appState.pendingMediaUploadType : 'image'); } catch (err) { showToast(err.message, 'error'); e.target.value = ''; return; }
            const idx = appState.activeShowIndex;
            const shows = appState.data.monthsData;
            const targetFileName = 'show' + (idx + 1) + '_mobile_' + Date.now() + '.' + file.name.split('.').pop().toLowerCase();
            const previewBlobUrl = URL.createObjectURL(file);

            shows[idx].mobileImage = './' + targetFileName;
            if (isPreviewingMobileCard) {
                document.getElementById('preview-card-img').src = previewBlobUrl;
            }

            if (!appState.pendingUploads) appState.pendingUploads = new Map();
            appState.pendingUploads.set(targetFileName, file);

            renderShowsSelector();
            showToast('✓ Фото карточки для Телефона выбрано! Переключите на «Превью: Телефон» для просмотра.');
            e.target.value = '';
        });

        // Add Photo or Video to media gallery & card side materials
        document.getElementById('btn-add-photo')?.addEventListener('click', () => {
            appState.pendingMediaUploadIndex = -1;
            appState.pendingMediaUploadType = 'image';
            document.getElementById('upload-media-item-file').click();
        });
        document.getElementById('btn-quick-add-photo')?.addEventListener('click', () => {
            appState.pendingMediaUploadIndex = -1;
            appState.pendingMediaUploadType = 'image';
            document.getElementById('upload-media-item-file').click();
        });
        document.getElementById('btn-add-video')?.addEventListener('click', () => {
            appState.pendingMediaUploadIndex = -1;
            appState.pendingMediaUploadType = 'video';
            document.getElementById('upload-media-item-file').click();
        });
        document.getElementById('btn-quick-add-video')?.addEventListener('click', () => {
            appState.pendingMediaUploadIndex = -1;
            appState.pendingMediaUploadType = 'video';
            document.getElementById('upload-media-item-file').click();
        });
        document.getElementById('btn-logout-mobile')?.addEventListener('click', () => {
            document.getElementById('btn-logout')?.click();
        });

        document.getElementById('upload-media-item-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try { await verifyUpload(file, e.target.id === 'upload-media-item-file' ? appState.pendingMediaUploadType : 'image'); } catch (err) { showToast(err.message, 'error'); e.target.value = ''; return; }
            const isVideo = appState.pendingMediaUploadType === 'video';
            const showIdx = appState.activeShowIndex;
            const show = appState.data.monthsData[showIdx];
            if (!show.media) show.media = [];

            const ext = file.name.split('.').pop().toLowerCase();
            const timestamp = Date.now();
            const targetFileName = 'show' + (showIdx + 1) + '_' + (isVideo ? 'video' : 'photo') + '_' + timestamp + '.' + ext;
            const previewBlobUrl = URL.createObjectURL(file);

            if (!appState.pendingUploads) appState.pendingUploads = new Map();
            appState.pendingUploads.set(targetFileName, file);

            if (appState.pendingMediaUploadIndex >= 0) {
                const item = show.media[appState.pendingMediaUploadIndex];
                item.url = targetFileName;
                item._blobPreview = previewBlobUrl;
                if (!isVideo) item.poster = targetFileName;
            } else {
                show.media.push({
                    type: isVideo ? 'video' : 'image',
                    url: targetFileName,
                    poster: isVideo ? show.image : targetFileName,
                    label: isVideo ? 'Видео шоу' : 'Фото со сцены',
                    _blobPreview: previewBlobUrl,
                    pos: '50% 50%',
                    scale: 1.0
                });
            }

            renderShowMediaGrid(show);
            showToast('✓ Медиафайл добавлен! Нажмите «🚀 Опубликовать на сайт», чтобы сохранить.');
            e.target.value = '';
        });

        // Banner tab upload handlers
        document.getElementById('btn-upload-desktop-banner')?.addEventListener('click', () => {
            document.getElementById('upload-banner-desktop-file').click();
        });
        document.getElementById('upload-banner-desktop-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try { await verifyUpload(file, e.target.id === 'upload-media-item-file' ? appState.pendingMediaUploadType : 'image'); } catch (err) { showToast(err.message, 'error'); e.target.value = ''; return; }
            const previewBlobUrl = URL.createObjectURL(file);
            const desktopImg = document.getElementById('banner-preview-img');
            if (desktopImg) desktopImg.src = previewBlobUrl;
            if (!appState.pendingUploads) appState.pendingUploads = new Map();
            const target = 'img/index/banner_' + Date.now() + '.' + file.name.split('.').pop().toLowerCase();
            appState.pendingUploads.set(target, file);
            appState.data.banner.desktopImage = target;
            showToast('✓ Баннер для ПК выбран! Нажмите «🚀 Опубликовать на сайт», чтобы сохранить.');
            e.target.value = '';
        });

        document.getElementById('btn-upload-mobile-banner')?.addEventListener('click', () => {
            document.getElementById('upload-banner-mobile-file').click();
        });
        document.getElementById('upload-banner-mobile-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try { await verifyUpload(file, e.target.id === 'upload-media-item-file' ? appState.pendingMediaUploadType : 'image'); } catch (err) { showToast(err.message, 'error'); e.target.value = ''; return; }
            const previewBlobUrl = URL.createObjectURL(file);
            const mobileImg = document.getElementById('banner-mobile-preview-img');
            if (mobileImg) mobileImg.src = previewBlobUrl;
            if (!appState.pendingUploads) appState.pendingUploads = new Map();
            const target = 'img/index/banner_mobile_' + Date.now() + '.' + file.name.split('.').pop().toLowerCase();
            appState.pendingUploads.set(target, file);
            appState.data.banner.mobileImage = target;
            showToast('✓ Мобильный баннер выбран! Нажмите «🚀 Опубликовать на сайт», чтобы сохранить.');
            e.target.value = '';
        });

        // Contacts tab
        function renderContactsTab() {
            const links = appState.data?.links || {};
            document.getElementById('link-max').value = links.max || '';
            document.getElementById('link-telegram').value = links.telegram || '';
            document.getElementById('link-vk-personal').value = links.vkPersonal || '';
            document.getElementById('link-vk-group').value = links.vkGroup || '';
            document.getElementById('link-instagram').value = links.instagram || '';
            document.getElementById('contact-phone').value = links.phone || '';
            document.getElementById('contact-email').value = links.email || '';
            document.getElementById('contact-address').value = links.address || '';
        }

        function saveContactsFromForm() {
            if (!appState.data) appState.data = {};
            if (!appState.data.links) appState.data.links = {};
            appState.data.links = {
                max: document.getElementById('link-max').value.trim(),
                telegram: document.getElementById('link-telegram').value.trim(),
                vkPersonal: document.getElementById('link-vk-personal').value.trim(),
                vkGroup: document.getElementById('link-vk-group').value.trim(),
                instagram: document.getElementById('link-instagram').value.trim(),
                phone: document.getElementById('contact-phone').value.trim(),
                email: document.getElementById('contact-email').value.trim(),
                address: document.getElementById('contact-address').value.trim()
            };
        }

        document.getElementById('btn-save-contacts').addEventListener('click', () => {
            saveContactsFromForm();
            awaitDraftSave();
        });
        document.getElementById('btn-save-show').addEventListener('click', () => {
            saveCurrentShowFormToState();
            awaitDraftSave();
        });


        async function saveAllData() { await awaitDraftSave(); }
        document.getElementById('btn-save-all').addEventListener('click',saveAllData);
        function lockEditor(value) {
            publishing = value;
            document.getElementById('dashboard-screen').inert = value;
            const button = document.getElementById('btn-publish-all');
            button.textContent = value ? 'Публикация… не закрывайте вкладку' : '🚀 Опубликовать на сайт';
        }
        async function githubRequest(path, options={}) {
            if (!appState.github.token) throw new Error('Сессия GitHub закрыта. Войдите снова; черновик останется в браузере.');
            return jsonRequest('https://api.github.com/repos/' + appState.github.owner + '/' + appState.github.repo + path, {
                ...options, headers:{'Authorization':'Bearer '+appState.github.token,'Accept':'application/vnd.github+json','Content-Type':'application/json',...options.headers}
            });
        }
        const b64Utf8 = value => btoa(Array.from(new TextEncoder().encode(value),b=>String.fromCharCode(b)).join(''));
        const decodeB64 = value => new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,'')),c=>c.charCodeAt(0)));
        async function publishAllToGitHub() {
            if (publishing || appState.loading) return;
            lockEditor(true);
            let snapshot, uploads;
            try {
                saveCurrentShowFormToState(); saveContactsFromForm();
                snapshot = TaisContent.validate(appState.data);
                await persistDraft(true);
                const used = new Set([snapshot.banner.desktopImage,snapshot.banner.mobileImage,...snapshot.monthsData.flatMap(show=>[show.image,show.mobileImage,...show.media.flatMap(item=>[item.url,item.poster])])].filter(Boolean).map(url=>url.split(/[?#]/)[0].replace(/^\.\//,'')));
                uploads = [...appState.pendingUploads.entries()].filter(([path])=>used.has(path));
                for (const [path,file] of uploads) {
                    if (!/^(?:img\/(?:index|block)\/)?[\w.-]+\.(png|jpe?g|webp|gif|avif|mp4|webm|mov|m4v)$/i.test(path)) throw new Error('Недопустимый путь файла: '+path);
                    await verifyUpload(file,/\.(mp4|webm|mov|m4v)$/i.test(path)?'video':'image');
                }
            } catch(err) { lockEditor(false); showToast('Публикация отменена: '+err.message,'error'); return; }
            lockEditor(true);
            try {
                let published;
                if (await isServerAvailable()) {
                    // The server validates an unchanged content base before writing anything.
                    for (const [path,file] of uploads) {
                        const form = new FormData(); form.append('relativePath',path); form.append('mediaFile',file,file.name);
                        await jsonRequest('/api/admin/upload-media',{method:'POST',body:form});
                    }
                    await jsonRequest('/api/admin/save-data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:snapshot,baseContent:appState.baseContent})});
                    published = await jsonRequest('/api/admin/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
                } else {
                    const branch = appState.github.branch;
                    const ref = await githubRequest('/git/ref/heads/'+encodeURIComponent(branch));
                    const commit = await githubRequest('/git/commits/'+ref.object.sha);
                    // Read from the commit being updated, never from a stale CDN or admin DOM.
                    const file = await githubRequest('/contents/index.html?ref='+ref.object.sha);
                    if (file.encoding!=='base64') throw new Error('GitHub вернул неподдерживаемый формат index.html');
                    const currentHtml = decodeB64(file.content);
                    const remote = TaisContent.read(currentHtml);
                    if (TaisContent.stringify(remote)!==appState.baseContent) throw new Error('Сайт уже изменён в другой сессии. Черновик сохранён. Перезагрузите данные и объедините изменения, чтобы не затереть чужую публикацию.');
                    const nextHtml = TaisContent.write(currentHtml,snapshot);
                    const items = [];
                    const indexBlob = await githubRequest('/git/blobs',{method:'POST',body:JSON.stringify({content:b64Utf8(nextHtml),encoding:'base64'})});
                    items.push({path:'index.html',mode:'100644',type:'blob',sha:indexBlob.sha});
                    for (const [path,upload] of uploads) {
                        showToast('Загрузка: '+path,'info');
                        const blob = await githubRequest('/git/blobs',{method:'POST',body:JSON.stringify({content:await fileToBase64(upload),encoding:'base64'})});
                        items.push({path,mode:'100644',type:'blob',sha:blob.sha});
                    }
                    const tree = await githubRequest('/git/trees',{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:items})});
                    const newCommit = await githubRequest('/git/commits',{method:'POST',body:JSON.stringify({message:'Обновление контента Та-Ис через админку',tree:tree.sha,parents:[ref.object.sha]})});
                    // If another publisher won the race, GitHub rejects this non-fast-forward update.
                    await githubRequest('/git/refs/heads/'+encodeURIComponent(branch),{method:'PATCH',body:JSON.stringify({sha:newCommit.sha,force:false})});
                    const verification = await githubRequest('/contents/index.html?ref='+newCommit.sha);
                    if (TaisContent.stringify(TaisContent.read(decodeB64(verification.content)))!==TaisContent.stringify(snapshot)) throw new Error('Коммит создан, но контрольная проверка данных не пройдена. Не повторяйте публикацию до проверки.');
                    published = {commitSha:newCommit.sha.slice(0,7)};
                }
                appState.data = snapshot; appState.baseContent = TaisContent.stringify(snapshot); appState.pendingUploads.clear();
                await draftDelete(); dirty=false;
                const label = document.getElementById('gh-last-commit'); if(label) label.textContent = published.commitSha ? '['+published.commitSha+']' : 'Сохранено на сервере';
                showToast(published.localOnly ? 'Сайт обновлён на сервере. GitHub не настроен.' : 'Данные и материалы проверены и отправлены в GitHub. Дождитесь успешного развёртывания GitHub Pages.');
            } catch(err) { showToast('Публикация не завершена: '+err.message+'. Черновик и выбранные файлы сохранены.','error'); }
            finally { lockEditor(false); }
        }
        document.getElementById('btn-publish-all').addEventListener('click',publishAllToGitHub);
        document.getElementById('change-pass-form').addEventListener('submit',async event => {
            event.preventDefault();
            try {
                if (!await isServerAvailable()) return;
                await jsonRequest('/api/admin/change-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword:document.getElementById('curr-pass').value,newPassword:document.getElementById('new-pass').value})});
                event.target.reset(); showToast('Пароль изменён. Войдите заново.'); setAuthenticated(false);
            } catch(err) { showToast(err.message,'error'); }
        });
        checkAuth().catch(err=>showToast(err.message,'error'));

