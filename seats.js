document.addEventListener('DOMContentLoaded', function() {
    const bgOverflow = document.getElementsByClassName('event_tickets_overlay');
    const orderForm = document.getElementById('order-event-form');
    const eventSeasonsContainer = document.querySelector('.event-seasons');
    const eventsSection = document.querySelector('#events');
    let modalName = '';

    window.OrderData = {
        orderNumber: "",
        total: 0,
        ticketsCount: 0,
        seatNumbers: [],
        seatIds: [],
        amountSale: 0
    };
    

    if (!window.monthsData || !Array.isArray(window.monthsData) || window.monthsData.length === 0) {
        console.warn('Нет данных для monthsData');
        return;
    }

    const monthNames = {
        "01": 'Январь', "02": 'Февраль', "03": 'Март', "04": 'Апрель', "05": 'Май', "06": 'Июнь',
        "07": 'Июль', "08": 'Август', "09": 'Сентябрь', "10": 'Октябрь', "11": 'Ноябрь', "12": 'Декабрь'
    };

    const monthsData = window.monthsData.map(m => {
        const num = parseInt(m.month, 10);

        return {
            ...m,
            monthNum: num,
            monthText: monthNames[String(num).padStart(2, "0")] || m.month
        };
    });
    
    let savedScrollPosition = null;
    let lastClickedEventItem = null;

    function saveScrollPosition(element) {
        if (element) {
            lastClickedEventItem = element;
        }
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
        if (currentScroll > 0) {
            savedScrollPosition = currentScroll;
        }
    }

    function lockBackgroundScroll() {
        if (savedScrollPosition === null) {
            const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
            savedScrollPosition = currentScroll;
        }
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');
        document.body.classList.add('no-scroll');
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollPosition}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }

    function unlockBackgroundScroll() {
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        document.body.classList.remove('no-scroll');
        const targetY = savedScrollPosition;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        if (typeof targetY === 'number') {
            window.scrollTo({
                top: targetY,
                left: 0,
                behavior: 'instant'
            });
            savedScrollPosition = null;
        }
    }

    function restoreScrollPosition() {
        unlockBackgroundScroll();
    }

    // Block scrolling of the background anywhere on the page when modal is open,
    // allowing scrolling inside the description text area, thumbs column, and scrollable modal parts.
    function handleModalWheel(e) {
        const openModal = document.querySelector('.event_tickets.new_modal_layout, .event_tickets[style*="flex"], .event_tickets[style*="block"]');
        if (!openModal || openModal.style.display === 'none') return;

        const scrollable = e.target.closest('.modal-desc-content, .modal-details-scrollable, .thumbs-col, .thumbs-wrapper, .new_modal_layout, .side-materials-scroll-container');
        if (!scrollable) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        const delta = e.deltaY;
        const atTop = scrollable.scrollTop <= 0;
        const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;
        if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    function handleModalTouchMove(e) {
        if (e.target.closest('#order-messenger-modal, .order-messenger-modal-overlay, .order-messenger-modal-card')) return;
        const openModal = document.querySelector('.event_tickets.new_modal_layout, .event_tickets[style*="flex"], .event_tickets[style*="block"]');
        if (!openModal || openModal.style.display === 'none') return;

        const scrollable = e.target.closest('.modal-desc-content, .modal-details-scrollable, .thumbs-col, .thumbs-wrapper, .new_modal_layout, .side-materials-scroll-container');
        if (!scrollable) {
            e.preventDefault();
            return false;
        }
    }

    window.addEventListener('wheel', handleModalWheel, { passive: false });
    window.addEventListener('touchmove', handleModalTouchMove, { passive: false });

    function closeCurrentModal() {
        const openModals = document.querySelectorAll('.event_tickets');
        openModals.forEach(m => {
            m.style.display = 'none';
            m.style.setProperty('display', 'none', 'important');
            m.querySelectorAll('video').forEach(v => {
                try {
                    v.pause();
                    v.currentTime = 0;
                } catch(e) {}
            });
            try { m.remove(); } catch(e) {}
        });
        if (orderForm) {
            orderForm.style.display = 'none';
        }
        if (typeof bgOverflow !== 'undefined' && bgOverflow) {
            if (bgOverflow.style) bgOverflow.style.display = 'none';
            if (bgOverflow[0] && bgOverflow[0].style) bgOverflow[0].style.display = 'none';
        }
        if (typeof disableModalZoomLock === 'function') {
            disableModalZoomLock();
        }
        if (typeof window.closeOrderMessengerModal === 'function') {
            window.closeOrderMessengerModal();
        }
        unlockBackgroundScroll();
    }
    window.closeCurrentModal = closeCurrentModal;

    window.closeShowModal = closeCurrentModal;

    function enableModalZoomLock() {
      document.documentElement.classList.add('modal-open');
    
      document.addEventListener('gesturestart', block, { passive:false });
      document.addEventListener('gesturechange', block, { passive:false });
      document.addEventListener('gestureend', block, { passive:false });
    }
    
    function disableModalZoomLock() {
      document.documentElement.classList.remove('modal-open');
    
      document.removeEventListener('gesturestart', block);
      document.removeEventListener('gesturechange', block);
      document.removeEventListener('gestureend', block);
    }
    
    function block(e){
      e.preventDefault();
    }

    function openShowModal(data, index, eventItem) {
        if (!data) return;
        const monthYear = data.id;
        if (eventItem) saveScrollPosition(eventItem);
        const existingModal = document.querySelector(`#event_tickets_${monthYear}`);
        if (existingModal) {
            openEventTickets(monthYear);
            return;
        }
        const eventTickets = createEventTickets(data, index);
        document.body.appendChild(eventTickets);
        openEventTickets(monthYear);
    }

    function bindCardOpenEvents(eventItem, data, index) {
        eventItem.style.cursor = 'pointer';
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let moved = false;
        let lastTriggerTime = 0;

        function triggerOpen(e) {
            const now = Date.now();
            if (now - lastTriggerTime < 500) return;
            lastTriggerTime = now;
            window._lastModalOpenTime = now;
            if (e && e.cancelable && e.type !== 'click') e.preventDefault();
            openShowModal(data, index, eventItem);
        }

        eventItem.addEventListener('touchstart', function(e) {
            if (e.touches && e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTime = Date.now();
                moved = false;
            }
        }, { passive: true });

        eventItem.addEventListener('touchmove', function(e) {
            if (e.touches && e.touches.length === 1) {
                const dx = Math.abs(e.touches[0].clientX - startX);
                const dy = Math.abs(e.touches[0].clientY - startY);
                if (dx > 10 || dy > 10) {
                    moved = true;
                }
            }
        }, { passive: true });

        eventItem.addEventListener('touchend', function(e) {
            const duration = Date.now() - startTime;
            if (!moved && !window._isSwipingCards && duration < 600) {
                triggerOpen(e);
            }
        }, { passive: false });

        eventItem.addEventListener('click', function(e) {
            if (window._isSwipingCards || Date.now() - (window._lastCardsSwipe || 0) < 400) return;
            triggerOpen(e);
        });
        eventItem.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerOpen(e); }
        });
    }

    function createEventItem(monthData, index) {
        const { monthText, year, image, monthNum } = monthData;
        const monthYear = monthData.id;

        const eventItem = document.createElement('div');
        eventItem.className = 'event-item swiper-slide';
        eventItem.setAttribute('data-index', index);

        const imgBg = document.createElement('img');
        const isMobileScreen = typeof window !== 'undefined' && window.innerWidth <= 960;
        const effectiveImg = (isMobileScreen && monthData.mobileImage) ? monthData.mobileImage : image;
        imgBg.src = effectiveImg;
        imgBg.alt = 'afisha background';
        imgBg.className = 'background-image';
        imgBg.loading = (index < 4 ? 'eager' : 'lazy');
        imgBg.decoding = 'async';
        if (index < 2) {
            imgBg.fetchPriority = 'high';
        }

        const imgOverlay = document.createElement('img');
        imgOverlay.src = './red_frame.png';
        imgOverlay.alt = 'red frame';
        imgOverlay.className = 'overlay-image';

        const content = document.createElement('div');
        content.className = 'content';

        const title = document.createElement('h2');
        title.textContent = monthData.title || 'НАЗВАНИЕ ШОУ'; 
        const divider = document.createElement('hr');
        divider.className = 'card-divider';
        const subtitle = document.createElement('p');
        subtitle.className = 'card-subtitle';
        subtitle.textContent = monthData.description || 'ОПИСАНИЕ ШОУ'; // Keeping month as subtitle so it matches original data loosely

        
        bindCardOpenEvents(eventItem, monthData, index);
        
        if (!monthData.is_custom_image) {
            content.appendChild(title);
            content.appendChild(divider);
            content.appendChild(subtitle);
            eventItem.appendChild(imgBg);
            eventItem.appendChild(imgOverlay);
        } else {
            content.classList.add('custom-image-content');
            eventItem.appendChild(imgBg);
            
            imgBg.style.position = 'absolute';
            imgBg.style.top = '0';
            imgBg.style.left = '0';
            imgBg.style.width = '100%';
            imgBg.style.height = '100%';
            imgBg.style.objectFit = 'cover';
            // Show cards 3 (55% vertical), 6, 7, 9, 10 have text aligned towards bottom, 4 shifted to show girl on right, 1, 2, 5, 8 towards left/center
            const showPosMap = window.siteContent.showPosMap;
            const posVal = showPosMap[index + 1] || 'left center';
            const posStr = typeof posVal === 'string' ? posVal : (posVal.pos || 'left center');
            const scaleVal = (typeof posVal === 'object' && posVal && posVal.scale) ? posVal.scale : 1;
            imgBg.style.setProperty('object-position', posStr, 'important');
            imgBg.style.setProperty('transform-origin', posStr, 'important');
            if (scaleVal && scaleVal !== 1) {
                imgBg.style.setProperty('transform', `scale(${scaleVal})`, 'important');
            } else {
                imgBg.style.setProperty('transform', 'none', 'important');
            }
        }
        eventItem.appendChild(content);



        return eventItem;
    }

    
function createEventTickets(monthData, index) {
    const { monthText, year, monthNum, image } = monthData;
    const monthYear = monthData.id;

    const eventTickets = document.createElement('div');
    eventTickets.className = 'event_tickets new_modal_layout';
    eventTickets.id = `event_tickets_${monthYear}`;
    eventTickets.dataset.month = `${monthNum}/${year}`;
    
    // Apply modal styles inline to override existing css safely
    eventTickets.style.display = 'flex';
    
    eventTickets.style.flexDirection = 'column';
    eventTickets.style.width = '95vw';
    eventTickets.style.maxWidth = '1200px';
    eventTickets.style.height = '85vh';
    eventTickets.style.maxHeight = '800px';
    eventTickets.style.borderRadius = '16px';
    eventTickets.style.border = '1px solid #333';
    eventTickets.style.padding = '30px';
    eventTickets.style.boxSizing = 'border-box';
    eventTickets.style.boxShadow = '0 10px 40px rgba(0,0,0,0.8)';
    
    // Background - solid dark luxury tone for maximum readability
    eventTickets.style.backgroundColor = '#131316';
    eventTickets.style.backdropFilter = 'none';
    eventTickets.style.webkitBackdropFilter = 'none';

    const eventTitle = document.createElement('div');
    eventTitle.className = 'event_title';
    eventTitle.style.display = 'flex';
    eventTitle.style.alignItems = 'center';
    eventTitle.style.justifyContent = 'center';
    eventTitle.style.marginBottom = '20px';
    eventTitle.style.padding = '0';
    eventTitle.style.position = 'relative'; // For close button positioning

    const prev = document.createElement('a');
    prev.className = 'black_button event_prev desktop-only-btn';
    prev.href = 'javascript:void(0);';
    prev.textContent = 'Предыдущее';
    prev.style.minWidth = '140px';
    prev.style.textAlign = 'center';
    prev.style.position = 'absolute';
    prev.style.left = '0';
    if (index === 0) {
        prev.style.opacity = '0.4';
        prev.style.pointerEvents = 'none';
    } else {
        prev.addEventListener('click', function(e) {
            e.preventDefault();
            openOrCreateEventTickets(index - 1);
        });
    }

    const heading = document.createElement('h1');
    heading.textContent = monthData.title || 'НАЗВАНИЕ МЕРОПРИЯТИЯ';
    heading.style.margin = '0';
    heading.style.fontSize = 'clamp(18px, 4vw, 32px)';
    heading.style.color = '#f8e7bc';
    heading.style.textAlign = 'center';
    heading.style.fontFamily = 'Playfair Display, serif';
    heading.style.flex = '1';

    const next = document.createElement('a');
    next.className = 'black_button event_next desktop-only-btn';
    next.href = 'javascript:void(0);';
    next.textContent = 'Следующее';
    next.style.minWidth = '140px';
    next.style.textAlign = 'center';
    next.style.position = 'absolute';
    next.style.right = '55px';
    if (index === window.monthsData.length - 1) {
        next.style.opacity = '0.4';
        next.style.pointerEvents = 'none';
    } else {
        next.addEventListener('click', function(e) {
            e.preventDefault();
            openOrCreateEventTickets(index + 1);
        });
    }

    const closeBtn = document.createElement('a');
    closeBtn.className = 'close_event_tickets';
    closeBtn.href = 'javascript:void(0);';
    closeBtn.setAttribute('role', 'button');
    closeBtn.setAttribute('aria-label', 'Закрыть');
    closeBtn.style.display = 'inline-flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '0';
    closeBtn.style.top = '50%';
    closeBtn.style.transform = 'translateY(-50%)';
    closeBtn.style.transition = 'opacity 0.2s';
    closeBtn.style.zIndex = '1000';
    closeBtn.style.pointerEvents = 'auto';
    closeBtn.style.touchAction = 'manipulation';
    closeBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f8e7bc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block; pointer-events: none;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    closeBtn.onmouseenter = () => { closeBtn.style.opacity = '0.7'; };
    closeBtn.onmouseleave = () => { closeBtn.style.opacity = '1'; };
    function handleModalClose(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        closeCurrentModal();
    }
    closeBtn.addEventListener('click', handleModalClose);
    closeBtn.addEventListener('touchend', handleModalClose);

    eventTitle.appendChild(prev);
    eventTitle.appendChild(heading);
    eventTitle.appendChild(next);
    eventTitle.appendChild(closeBtn);

    const hr = document.createElement('hr');
    hr.style.borderColor = '#444';
    hr.style.margin = '0';

    const bodyContainer = document.createElement('div');
    bodyContainer.className = 'modal-body-container';
    bodyContainer.style.display = 'flex';
    bodyContainer.style.gap = '20px';
    bodyContainer.style.marginTop = '20px';
    bodyContainer.style.flex = '1';
    bodyContainer.style.overflow = 'hidden';

    // Left Column: Thumbnails
    const thumbsWrapper = document.createElement('div');
    thumbsWrapper.className = 'thumbs-wrapper';
    thumbsWrapper.style.display = 'flex';
    thumbsWrapper.style.flexDirection = 'column';
    thumbsWrapper.style.alignItems = 'stretch';
    thumbsWrapper.style.gap = '10px';
    thumbsWrapper.style.width = '140px';
    thumbsWrapper.style.minWidth = '140px';
    thumbsWrapper.style.maxWidth = '140px';
    thumbsWrapper.style.height = '100%';
    thumbsWrapper.style.maxHeight = '100%';
    thumbsWrapper.style.flexShrink = '0';
    thumbsWrapper.style.overflow = 'hidden';
    thumbsWrapper.style.boxSizing = 'border-box';

    const leftArrow = document.createElement('button');
    leftArrow.innerHTML = '&#10094;';
    leftArrow.className = 'thumb-arrow thumb-arrow-left';
    leftArrow.style.background = 'transparent';
    leftArrow.style.border = 'none';
    leftArrow.style.color = '#f8e7bc';
    leftArrow.style.fontSize = '24px';
    leftArrow.style.cursor = 'pointer';

    const rightArrow = document.createElement('button');
    rightArrow.innerHTML = '&#10095;';
    rightArrow.className = 'thumb-arrow thumb-arrow-right';
    rightArrow.style.background = 'transparent';
    rightArrow.style.border = 'none';
    rightArrow.style.color = '#f8e7bc';
    rightArrow.style.fontSize = '24px';
    rightArrow.style.cursor = 'pointer';

    const thumbsCol = document.createElement('div');
    thumbsCol.className = 'thumbs-col';

    thumbsCol.style.display = 'flex';
    thumbsCol.style.flexDirection = 'column';
    thumbsCol.style.gap = '15px';
    thumbsCol.style.width = '100%';
    thumbsCol.style.height = '100%';
    thumbsCol.style.maxHeight = '100%';
    thumbsCol.style.overflowY = 'auto';
    thumbsCol.style.overflowX = 'hidden';
    thumbsCol.style.paddingRight = '6px';
    thumbsCol.style.paddingBottom = '75px';
    thumbsCol.style.boxSizing = 'border-box';
    thumbsCol.style.scrollbarWidth = 'thin';
    thumbsCol.style.scrollbarColor = '#c5a059 rgba(255, 255, 255, 0.08)';
    thumbsCol.style.webkitOverflowScrolling = 'touch';

    // Direct wheel scroll listener on thumbs column
    thumbsCol.addEventListener('wheel', (e) => {
        e.stopPropagation();
        thumbsCol.scrollTop += e.deltaY;
    }, { passive: true });

    const createThumb = (text, isVideo, bgUrl, posterUrl, pos) => {
        const t = document.createElement('div');
        t.style.width = '100%';
        t.style.height = '90px';
        t.style.minHeight = '90px';
        t.style.backgroundColor = 'rgba(25, 20, 22, 0.7)';
        t.style.display = 'flex';
        t.style.alignItems = 'center';
        t.style.justifyContent = 'center';
        t.style.cursor = 'pointer';
        t.style.borderRadius = '8px';
        t.style.border = '2px solid rgba(248, 231, 188, 0.2)';
        t.style.color = '#fff';
        t.style.fontFamily = 'Onest, sans-serif';
        t.style.fontSize = '14px';
        t.style.flexShrink = '0';
        t.style.transition = 'all 0.3s ease';
        t.style.position = 'relative';
        t.style.overflow = 'hidden';
        
        t.onmouseenter = () => {
            t.style.borderColor = '#8b1014';
        };
        t.onmouseleave = () => {
            t.style.borderColor = t.style.borderWidth === '2px' ? (t.style.borderColor === 'rgb(139, 16, 20)' || t.style.borderColor === '#8b1014' ? 'rgba(248, 231, 188, 0.2)' : t.style.borderColor) : 'rgba(248, 231, 188, 0.2)';
        };
        
        const effectiveImgUrl = isVideo 
            ? (posterUrl || (bgUrl ? bgUrl.replace(/\.mp4$/i, '_thumb.jpg').replace(/video(\d+)/i, 'v$1') : '') || (monthData && monthData.image ? monthData.image : ''))
            : (bgUrl || (monthData && monthData.image ? monthData.image : ''));
            
        if (effectiveImgUrl && effectiveImgUrl !== '') {
            const thumbImg = document.createElement('img');
            thumbImg.src = effectiveImgUrl;
            thumbImg.loading = 'lazy';
            thumbImg.decoding = 'async';
            thumbImg.alt = text || (isVideo ? 'Видео' : 'Фото');
            thumbImg.style.position = 'absolute';
            thumbImg.style.top = '0';
            thumbImg.style.left = '0';
            thumbImg.style.width = '100%';
            thumbImg.style.height = '100%';
            thumbImg.style.objectFit = 'cover';
            if (pos) {
                thumbImg.style.objectPosition = pos;
            }
            thumbImg.onerror = () => {
                if (!thumbImg._retriedAlt) {
                    thumbImg._retriedAlt = true;
                    if (thumbImg.src.includes('.webp')) {
                        thumbImg.src = thumbImg.src.replace('.webp', '.png');
                        return;
                    } else if (thumbImg.src.includes('.png')) {
                        thumbImg.src = thumbImg.src.replace('.png', '.webp');
                        return;
                    } else if (thumbImg.src.includes('.PNG')) {
                        thumbImg.src = thumbImg.src.replace('.PNG', '.webp');
                        return;
                    }
                }
                thumbImg.onerror = null;
                // If the thumbnail cannot load, remove this element so no blank empty frame is left
                t.remove();
                if (thumbsCol.children.length === 0) {
                    thumbsWrapper.style.display = 'none';
                }
            };
            t.appendChild(thumbImg);
        } else {
            return null;
        }
        
        if (isVideo) {
            const playBadge = document.createElement('span');
            playBadge.style.position = 'relative';
            playBadge.style.zIndex = '2';
            playBadge.style.fontSize = '22px';
            playBadge.style.color = '#f8e7bc';
            playBadge.style.textShadow = '0 2px 8px rgba(0,0,0,0.9)';
            playBadge.textContent = '▶';
            t.appendChild(playBadge);
        }
        
        return t;
    };

    
    const rawMedia = (monthData.media && monthData.media.length > 0) ? monthData.media : [
        { type: 'image', label: 'Фото 1', url: monthData.image || '' }
    ];
    // Filter out empty items
    const mediaItems = rawMedia.filter(it => it && (it.url || it.poster));

    const thumbsElements = [];
    mediaItems.forEach((item, i) => {
        const thumb = createThumb(item.label, item.type === 'video', item.url, item.poster, item.pos);
        if (!thumb) return;
        if (thumbsElements.length === 0) thumb.style.border = '2px solid #f8e7bc';
        thumbsCol.appendChild(thumb);
        thumbsElements.push({ el: thumb, data: item });
    });

    if (thumbsElements.length === 0) {
        thumbsWrapper.style.display = 'none';
    }

    // Middle Column: Main Frame
    const mainFrame = document.createElement('div');
    mainFrame.className = 'modal-main-frame';
    mainFrame.style.flex = '1';
    mainFrame.style.width = '100%';
    mainFrame.style.height = '100%';
    mainFrame.style.backgroundColor = 'transparent';
    mainFrame.style.border = 'none';
    mainFrame.style.display = 'flex';
    mainFrame.style.alignItems = 'center';
    mainFrame.style.justifyContent = 'center';
    mainFrame.style.overflow = 'hidden';
    mainFrame.style.position = 'relative';

    const mainDisplay = document.createElement('div');
    mainDisplay.className = 'modal-main-display';
    mainDisplay.style.width = '100%';
    mainDisplay.style.height = '100%';
    mainDisplay.style.maxWidth = '100%';
    mainDisplay.style.maxHeight = '100%';
    mainDisplay.style.display = 'flex';
    mainDisplay.style.alignItems = 'center';
    mainDisplay.style.justifyContent = 'center';
    mainDisplay.style.position = 'relative';
    mainDisplay.style.overflow = 'hidden';
    mainDisplay.style.borderRadius = '12px';
    mainDisplay.style.color = '#777';
    mainDisplay.style.fontFamily = 'Onest, sans-serif';
    mainDisplay.style.fontSize = '18px';
    mainFrame.appendChild(mainDisplay);
    
    function renderMedia(item) {
        // Stop any currently playing videos before switching
        mainDisplay.querySelectorAll('video').forEach(v => {
            try {
                v.pause();
                v.removeAttribute('src');
                v.load();
            } catch(e) {}
        });
        mainDisplay.innerHTML = '';
        if (!item.url) {
            mainDisplay.textContent = 'Здесь будет большое ' + (item.type === 'video' ? 'видео' : 'фото');
            return;
        }
        
        if (item.type === 'video') {
            const videoWrap = document.createElement('div');
            videoWrap.className = 'modal-video-wrap';
            videoWrap.style.position = 'relative';
            videoWrap.style.width = '100%';
            videoWrap.style.height = '100%';
            videoWrap.style.display = 'flex';
            videoWrap.style.alignItems = 'center';
            videoWrap.style.justifyContent = 'center';
            videoWrap.style.borderRadius = '12px';
            videoWrap.style.overflow = 'hidden';
            videoWrap.style.backgroundColor = '#000';

            const effectivePoster = item.poster || (item.url ? item.url.replace(/\.mp4$/i, '_thumb.jpg').replace(/video(\d+)/i, 'v$1') : '') || (monthData && monthData.image ? monthData.image : '');

            // 1. Video element with required iOS/Android attributes
            const video = document.createElement('video');
            video.className = 'modal-video-element';
            video.src = item.url;
            if (effectivePoster) {
                video.setAttribute('poster', effectivePoster);
            }
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('x5-playsinline', '');
            video.setAttribute('controls', '');
            video.controls = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain';
            video.style.borderRadius = '12px';
            video.style.border = '1px solid rgba(248, 231, 188, 0.25)';
            video.style.position = 'absolute';
            video.style.top = '0';
            video.style.left = '0';
            video.style.zIndex = '1';
            video.style.backgroundColor = '#000';

            // 2. High-resolution preview poster image covering the frame before playback
            const posterImg = document.createElement('img');
            posterImg.className = 'modal-video-poster';
            posterImg.src = effectivePoster;
            posterImg.alt = item.label || 'Видео превью';
            posterImg.loading = 'eager';
            posterImg.decoding = 'async';
            posterImg.style.width = '100%';
            posterImg.style.height = '100%';
            posterImg.style.objectFit = 'cover';
            posterImg.style.borderRadius = '12px';
            posterImg.style.border = '1px solid rgba(248, 231, 188, 0.25)';
            posterImg.style.position = 'absolute';
            posterImg.style.top = '0';
            posterImg.style.left = '0';
            posterImg.style.zIndex = '2';
            posterImg.style.cursor = 'pointer';
            posterImg.style.display = 'block';
            posterImg.onerror = () => {
                posterImg.onerror = null;
                if (monthData && monthData.image) {
                    posterImg.src = monthData.image;
                }
            };

            // 3. Play button centered on preview
            const bigPlay = document.createElement('button');
            bigPlay.className = 'modal-video-play-btn';
            bigPlay.setAttribute('type', 'button');
            bigPlay.setAttribute('aria-label', 'Воспроизвести видео');
            bigPlay.style.position = 'absolute';
            bigPlay.style.width = '64px';
            bigPlay.style.height = '64px';
            bigPlay.style.borderRadius = '50%';
            bigPlay.style.backgroundColor = 'rgba(139, 16, 20, 0.9)';
            bigPlay.style.border = '2px solid #f8e7bc';
            bigPlay.style.color = '#fff';
            bigPlay.style.fontSize = '26px';
            bigPlay.style.display = 'flex';
            bigPlay.style.alignItems = 'center';
            bigPlay.style.justifyContent = 'center';
            bigPlay.style.cursor = 'pointer';
            bigPlay.style.boxShadow = '0 0 25px rgba(0,0,0,0.8), 0 0 15px rgba(139, 16, 20, 0.6)';
            bigPlay.style.transition = 'transform 0.2s, background-color 0.2s';
            bigPlay.style.zIndex = '5';
            bigPlay.innerHTML = '<span style="margin-left: 4px;">▶</span>';
            bigPlay.onmouseenter = () => { bigPlay.style.transform = 'scale(1.1)'; bigPlay.style.backgroundColor = 'rgba(180, 20, 25, 0.95)'; };
            bigPlay.onmouseleave = () => { bigPlay.style.transform = 'scale(1)'; bigPlay.style.backgroundColor = 'rgba(139, 16, 20, 0.9)'; };

            const startPlaying = () => {
                posterImg.classList.add('is-hidden');
                posterImg.style.setProperty('display', 'none', 'important');
                posterImg.style.setProperty('visibility', 'hidden', 'important');
                posterImg.style.setProperty('opacity', '0', 'important');
                posterImg.style.setProperty('pointer-events', 'none', 'important');
                posterImg.style.setProperty('z-index', '-10', 'important');

                bigPlay.classList.add('is-hidden');
                bigPlay.style.setProperty('display', 'none', 'important');
                bigPlay.style.setProperty('visibility', 'hidden', 'important');
                bigPlay.style.setProperty('pointer-events', 'none', 'important');

                video.classList.remove('is-hidden');
                video.style.setProperty('display', 'block', 'important');
                video.style.setProperty('visibility', 'visible', 'important');
                video.style.setProperty('opacity', '1', 'important');
                video.style.setProperty('z-index', '10', 'important');
                video.style.setProperty('pointer-events', 'auto', 'important');

                video.preload = 'auto';
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.warn('Video play error:', err);
                    });
                }
            };

            bigPlay.addEventListener('click', (e) => {
                e.stopPropagation();
                startPlaying();
            });
            bigPlay.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                startPlaying();
            });

            posterImg.addEventListener('click', (e) => {
                e.stopPropagation();
                startPlaying();
            });
            posterImg.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                startPlaying();
            });

            video.addEventListener('play', () => {
                posterImg.classList.add('is-hidden');
                posterImg.style.setProperty('display', 'none', 'important');
                posterImg.style.setProperty('visibility', 'hidden', 'important');
                posterImg.style.setProperty('z-index', '-10', 'important');

                bigPlay.classList.add('is-hidden');
                bigPlay.style.setProperty('display', 'none', 'important');

                video.style.setProperty('z-index', '10', 'important');
            });

            video.addEventListener('ended', () => {
                posterImg.classList.remove('is-hidden');
                posterImg.style.setProperty('display', 'block', 'important');
                posterImg.style.setProperty('visibility', 'visible', 'important');
                posterImg.style.setProperty('opacity', '1', 'important');
                posterImg.style.setProperty('pointer-events', 'auto', 'important');
                posterImg.style.setProperty('z-index', '2', 'important');

                bigPlay.classList.remove('is-hidden');
                bigPlay.style.setProperty('display', 'flex', 'important');
                bigPlay.style.setProperty('visibility', 'visible', 'important');
                bigPlay.style.setProperty('pointer-events', 'auto', 'important');
                bigPlay.style.setProperty('z-index', '5', 'important');

                video.style.setProperty('z-index', '1', 'important');
            });

            videoWrap.appendChild(video);
            videoWrap.appendChild(posterImg);
            videoWrap.appendChild(bigPlay);
            mainDisplay.appendChild(videoWrap);
        } else {
            const img = document.createElement('img');
            img.src = item.url;
            img.loading = 'eager';
            img.decoding = 'async';
            img.alt = item.label || 'Фото';
            img.onerror = () => {
                if (!img._retriedAlt) {
                    img._retriedAlt = true;
                    if (img.src.includes('.webp')) {
                        img.src = img.src.replace('.webp', '.png');
                        return;
                    } else if (img.src.includes('.png')) {
                        img.src = img.src.replace('.png', '.webp');
                        return;
                    } else if (img.src.includes('.PNG')) {
                        img.src = img.src.replace('.PNG', '.webp');
                        return;
                    }
                }
                img.onerror = null;
                if (monthData && monthData.image && img.src !== monthData.image) {
                    img.src = monthData.image;
                } else {
                    img.style.display = 'none';
                    mainDisplay.textContent = 'Здесь будет большое фото';
                }
            };
            img.style.objectFit = 'cover';
            const posStr = item.pos || 'center';
            const scaleVal = (typeof item.scale === 'number') ? item.scale : 1;
            img.style.setProperty('object-position', posStr, 'important');
            img.style.setProperty('transform-origin', posStr, 'important');
            if (scaleVal !== 1) {
                img.style.setProperty('transform', `scale(${scaleVal})`, 'important');
            } else {
                img.style.setProperty('transform', 'none', 'important');
            }
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '12px';
            img.style.border = '1px solid rgba(248, 231, 188, 0.25)';
            img.style.backgroundColor = '#0d0d10';
            img.style.display = 'block';
            img.style.margin = 'auto';
            img.style.boxSizing = 'border-box';
            mainDisplay.appendChild(img);
        }
    }
    
    // Initial render
    if (mediaItems.length > 0) {
        renderMedia(mediaItems[0]);
    }

    // Right Column: Details
    const detailsCol = document.createElement('div');
    detailsCol.className = 'modal-details-col';
    detailsCol.style.width = '320px';
    detailsCol.style.maxWidth = '100%';
    detailsCol.style.boxSizing = 'border-box';
    detailsCol.style.display = 'flex';
    detailsCol.style.flexDirection = 'column';
    detailsCol.style.gap = '20px';
    detailsCol.style.padding = '10px 0';

    const desc = document.createElement('div');
    desc.className = 'modal-desc-content modal-details-scrollable';
    desc.style.flex = '1';
    desc.style.color = '#ffffff';
    desc.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.9)';
    desc.style.fontFamily = 'Onest, sans-serif';
    desc.style.lineHeight = '1.6';
    desc.style.overflowY = 'auto';
    desc.style.overscrollBehavior = 'contain';
    desc.style.webkitOverflowScrolling = 'touch';
    desc.style.paddingRight = '10px';
    desc.innerHTML = TaisContent.safeHtml(monthData.detailsText) || `
        <h3 style="color: #f8e7bc; margin-top: 0; font-size: 22px; font-weight: 500;">О шоу</h3>
        <p style="margin-bottom: 15px;">Уникальные номера, потрясающие костюмы и незабываемые эмоции. Погрузитесь в атмосферу настоящего праздника.</p>
        <p>Расскажем все подробности позже!</p>
    `;

    const orderBtn = document.createElement('a');
    orderBtn.className = 'red_button btn-order-show-trigger';
    orderBtn.href = 'javascript:void(0);';
    orderBtn.textContent = 'Заказать шоу';
    orderBtn.style.textAlign = 'center';
    orderBtn.style.width = '100%';
    orderBtn.style.boxSizing = 'border-box';
    orderBtn.style.padding = '15px';
    orderBtn.style.fontSize = '16px';
    orderBtn.style.cursor = 'pointer';
    orderBtn.style.touchAction = 'manipulation';
    function handleOrderClick(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (typeof window.openOrderMessengerModal === 'function') {
            window.openOrderMessengerModal();
        } else {
            window.open('https://max.ru/u/f9LHodD0cOIOskFbAwIl7OeGcFZvnuEDcH7BXo8yN8PP2OqPMHO7WYCB784', '_blank');
        }
    }
    orderBtn.addEventListener('click', handleOrderClick);
    orderBtn.addEventListener('touchend', handleOrderClick);

    detailsCol.appendChild(desc);
    detailsCol.appendChild(orderBtn);

    leftArrow.addEventListener('click', (e) => {
        e.preventDefault();
        thumbsCol.scrollBy({ left: -100, behavior: 'smooth' });
        thumbsCol.scrollBy({ top: -100, behavior: 'smooth' }); // for desktop vertical scroll
    });
    rightArrow.addEventListener('click', (e) => {
        e.preventDefault();
        thumbsCol.scrollBy({ left: 100, behavior: 'smooth' });
        thumbsCol.scrollBy({ top: 100, behavior: 'smooth' }); // for desktop vertical scroll
    });

    // thumbsWrapper.appendChild(leftArrow);
    thumbsWrapper.appendChild(thumbsCol);
    // thumbsWrapper.appendChild(rightArrow);

    bodyContainer.appendChild(thumbsWrapper);
    bodyContainer.appendChild(mainFrame);
    bodyContainer.appendChild(detailsCol);

    eventTickets.appendChild(eventTitle);
    eventTickets.appendChild(hr);
    eventTickets.appendChild(bodyContainer);

    // Add interactivity to thumbs
    thumbsElements.forEach(thumbObj => {
        thumbObj.el.addEventListener('click', () => {
            thumbsElements.forEach(x => x.el.style.border = '2px solid #444');
            thumbObj.el.style.border = '2px solid #f8e7bc';
            renderMedia(thumbObj.data);
        });
    });


    return eventTickets;
}

function openOrCreateEventTickets(targetIndex) {
        const data = monthsData[targetIndex];
        const monthYear = data.id;
        let modal = document.querySelector(`#event_tickets_${monthYear}`);
        if (!modal) {
            modal = createEventTickets(data, targetIndex);
            document.body.appendChild(modal);
        }
        openEventTickets(monthYear);
    }

    
function openEventTickets(monthYear) {
    lockBackgroundScroll();
    document.querySelectorAll('.event_tickets').forEach(t => (t.style.display = 'none'));
    const eventTickets = document.querySelector(`#event_tickets_${monthYear}`);
    if (!eventTickets) {
        unlockBackgroundScroll();
        return;
    }
    modalName = monthYear;
    eventTickets.style.display = 'flex';
}

function loadEventsList(eventTickets, monthNum, year) {
        const eventsList = eventTickets.querySelector('.events_list');
        eventsList.innerHTML = '';

        fetch(`/api/handler?action=get_events_for_month&month=${monthNum}&year=${year}`)
            .then(res => res.json())
            .then(events => {
                events.forEach(event => {
                    const eventItem = document.createElement('a');
                    eventItem.className = 'black_button event_list-item open-schedule-btn button button-active';
                    eventItem.dataset.id = event.id;
                    eventItem.textContent = `${event.formatted_date}`;

                    if (event.remaining_tickets === 0) {
                        eventItem.style.opacity = '0.5';
                        eventItem.style.pointerEvents = 'none';
                        eventItem.classList.add('soldout');
                    } else {
                        eventItem.addEventListener('click', function() {
                            const eventId = eventItem.dataset.id;
                            let rawText = this.textContent;
                            let cleanText = rawText.split(',').slice(0, 2).join(',');

                            const fullDays = {
                                "Пн": "Понедельник",
                                "Вт": "Вторник",
                                "Ср": "Среда",
                                "Чт": "Четверг",
                                "Пт": "Пятница",
                                "Сб": "Суббота",
                                "Вс": "Воскресенье"
                            };

                            Object.keys(fullDays).forEach(short => {
                                if (cleanText.includes(short)) {
                                    cleanText = cleanText.replace(short, fullDays[short]);
                                }
                            });

                            cleanText = cleanText.replace(
                                /(Понедельник|Вторник|Среда|Четверг|Пятница|Суббота|Воскресенье)\s+(\d{1,2}:\d{2})/,
                                '$1, $2'
                            );

                            document.querySelectorAll('.event_title h2').forEach(title => {
                                title.innerHTML = `Оформление билета <span>•</span> ${cleanText}`;
                            });

                            // eventTickets.remove();
                            eventTickets.style.display = 'none';
                            if (orderForm) orderForm.style.display = 'flex';
                            if (bgOverflow && bgOverflow[0]) bgOverflow[0].classList.add('active');
                            document.body.classList.add('no-scroll');
                            enableModalZoomLock();
                        });
                    }

                    eventsList.appendChild(eventItem);
                });
                setupEventListItemClickHandler();
            })
            .catch(err => console.error('Ошибка при загрузке событий:', err));
    }

    if (eventSeasonsContainer) {
        const existingCards = eventSeasonsContainer.querySelectorAll('.event-item');
        if (existingCards.length > 0) {
            existingCards.forEach((eventItem, i) => {
                const data = monthsData[i];
                if (!data) return;
                bindCardOpenEvents(eventItem, data, i);
            });
        } else {
            monthsData.forEach((data, i) => {
                const eventItem = createEventItem(data, i);
                eventSeasonsContainer.appendChild(eventItem);
            });
        }
    }

    // Mobile Swiper Slider for show cards (1 card per view with arrows & swipe)
    let eventsSwiperInstance = null;
    window._isSwipingCards = false;

    function setupEventsSlider() {
        const isMobile = window.innerWidth <= 960;
        const container = document.querySelector('.events-slider-container');
        const seasons = document.querySelector('.event-seasons');
        const prevBtn = document.querySelector('.events-nav-btn.prev');
        const nextBtn = document.querySelector('.events-nav-btn.next');
        const currentEl = document.querySelector('.events-current-num');
        const totalEl = document.querySelector('.events-total-num');

        if (!container || !seasons) return;

        const cards = seasons.querySelectorAll('.event-item');
        const total = cards.length || 10;
        if (totalEl) totalEl.textContent = total;

        function updateSlideVisibility(sw) {
            if (!sw || !sw.slides) return;
            const activeIdx = sw.activeIndex;
            sw.slides.forEach((slide, idx) => {
                if (idx === activeIdx) {
                    slide.style.opacity = '1';
                    slide.style.visibility = 'visible';
                    slide.style.pointerEvents = 'auto';
                } else {
                    slide.style.opacity = '0';
                    slide.style.visibility = 'hidden';
                    slide.style.pointerEvents = 'none';
                }
            });
        }

        function showAdjacentForTransition(sw) {
            if (!sw || !sw.slides) return;
            const activeIdx = sw.activeIndex;
            sw.slides.forEach((slide, idx) => {
                if (Math.abs(idx - activeIdx) <= 1) {
                    slide.style.visibility = 'visible';
                    slide.style.opacity = '1';
                }
            });
        }

        if (isMobile) {
            if (typeof Swiper !== 'undefined') {
                if (!eventsSwiperInstance) {
                    eventsSwiperInstance = new Swiper('.events-slider-container', {
                        slidesPerView: 1,
                        slidesPerGroup: 1,
                        spaceBetween: 0,
                        centeredSlides: false,
                        roundLengths: true,
                        speed: 350,
                        grabCursor: true,
                        touchRatio: 1,
                        threshold: 8,
                        touchAngle: 45,
                        watchOverflow: true,
                        resistance: true,
                        resistanceRatio: 0.85,
                        slidesOffsetBefore: 0,
                        slidesOffsetAfter: 0,
                        preventClicks: false,
                        preventClicksPropagation: false,
                        touchStartPreventDefault: false,
                        navigation: {
                            prevEl: prevBtn,
                            nextEl: nextBtn,
                            disabledClass: 'swiper-button-disabled'
                        },
                        on: {
                            init: function(sw) {
                                if (currentEl) currentEl.textContent = sw.realIndex + 1;
                                if (totalEl) totalEl.textContent = sw.slides ? sw.slides.length : total;
                                updateSlideVisibility(sw);
                            },
                            slideChange: function(sw) {
                                if (currentEl) currentEl.textContent = sw.realIndex + 1;
                            },
                            slideChangeTransitionStart: function(sw) {
                                showAdjacentForTransition(sw);
                            },
                            slideChangeTransitionEnd: function(sw) {
                                updateSlideVisibility(sw);
                            },
                            sliderFirstMove: function() { window._isSwipingCards = true; },
                            touchEnd: function(sw) {
                                if (window._isSwipingCards) {
                                    window._lastCardsSwipe = Date.now();
                                    setTimeout(() => { window._isSwipingCards = false; }, 0);
                                }
                            }
                        }
                    });
                } else {
                    eventsSwiperInstance.update();
                    updateSlideVisibility(eventsSwiperInstance);
                }
            }
        } else {
            if (eventsSwiperInstance) {
                eventsSwiperInstance.destroy(true, true);
                eventsSwiperInstance = null;
            }
            seasons.style.removeProperty('transform');
            seasons.style.removeProperty('transition');
            cards.forEach(card => {
                card.style.removeProperty('transform');
                card.style.removeProperty('opacity');
                card.style.removeProperty('visibility');
                card.style.removeProperty('pointer-events');
            });
        }
    }

    setupEventsSlider();
    setTimeout(setupEventsSlider, 150);
    window.addEventListener('load', setupEventsSlider);
    window.addEventListener('resize', () => {
        setupEventsSlider();
    }, { passive: true });


    const seats = document.querySelectorAll('.seat');
        let selectedSeats = [];
        let selectedSeatNumber = [];
        if (seats && seats.length > 0) {
            const orderNextStepButton = document.getElementById('order-next_step');
            const orderPrevStepButton = document.getElementById('order-prev_step');
            const seatsInfoDiv = document.querySelector('.order-info');
            const seatsLayout = document.querySelector('.seat-layout');
            const infoInputsDiv = document.querySelector('.info-inputs');
            const paymentSystemDiv = document.querySelector('.payment-system');
            const warningInfoDiv = document.getElementById('warning-info');
            const warningInfoDivText = document.getElementById('warning-info-text');
            const tablePurchaseDiv = document.getElementById('table-purchase'); 
            const yesButton = document.getElementById('purchase-yes');
            const noButton = document.getElementById('purchase-no');
            const purchaseButtons = document.getElementById('purchase-buttons');
            let dismissedTables = {};
            if (orderNextStepButton) orderNextStepButton.classList.remove('active');

            function getTicketWord(num) {
                num = Math.abs(num) % 100;
                let n1 = num % 10;
                if (num > 10 && num < 20) {
                    return 'билетов';
                }
                if (n1 > 1 && n1 < 5) {
                    return 'билета';
                }
                if (n1 === 1) {
                    return 'билет';
                }
                return 'билетов';
            }

            function updateSeatTotal() {
                let totalSeats = selectedSeats.length;
                let totalAmount = 0;
                selectedSeats.forEach(seatId => {
                    let seatCategory = document.querySelector(`#${seatId}`).getAttribute('data-category');
                    let seatPrice = ticketPrices[seatCategory] || 0;
                    totalAmount += parseFloat(seatPrice) || 0;
                });

                const formattedTotal = totalAmount.toLocaleString('ru-RU');

                let seatTotalDiv = document.querySelector('.seat-total');
                let infoSeatTickets = document.querySelector('.info-seat-tickets');
                let infoSeatTotal = document.querySelector('.info-seat-total');
                // let inputTotal = document.querySelector('#input-total');
                // let ticketsTotal = document.querySelector('#tickets-total');
                if (seatTotalDiv) {
                    let ticketWord = getTicketWord(totalSeats);
                    seatTotalDiv.innerHTML = `Вы выбрали ${totalSeats} ${ticketWord} на сумму ${formattedTotal} ₽`;
                }
                if (infoSeatTickets) {
                    let ticketWord = getTicketWord(totalSeats);
                    infoSeatTickets.innerHTML = `${totalSeats} ${ticketWord} <span class="dots"></span> ${formattedTotal} ₽`;
                    infoSeatTotal.innerHTML = `Итого <span class="dots"></span> ${formattedTotal} ₽`;
                    // inputTotal.value = `${totalAmount}`;
                    // ticketsTotal.value = `${totalSeats}`;
                    window.OrderData.total = totalAmount;
                    window.OrderData.ticketsCount = totalSeats;
                    // console.log("OrderData updated:", OrderData);
                }
                if (totalSeats > 0) {
                    // orderNextStepButton.style.display = 'flex';
                    orderNextStepButton.classList.add('active');
                } else {
                    // orderNextStepButton.style.display = 'none';
                    orderNextStepButton.classList.remove('active');
                    document.getElementById('seat-info-container').style.removeProperty('display');
                }
                updateButtonOpacity();
            }

            function updateButtonOpacity() {
                let invalidSeats = areSeatsValid();
                if (areSeatsValid()) {
                    // orderNextStepButton.style.pointerEvents = 'all';
                    // orderNextStepButton.style.opacity = '1';
                    // orderNextStepButton.classList.add('active');
                    warningInfoDiv.style.display = 'none';
                    warningInfoDivText.style.display = 'none';
                } else {
                    // orderNextStepButton.style.pointerEvents = 'none';
                    // orderNextStepButton.style.opacity = '0.5';
                    document.getElementById('seat-info-container').style.removeProperty('display');
                    orderNextStepButton.classList.remove('active');
                    let invalidSeats = getInvalidSeats();
                    let warningMessage = `Ограничение на выбор мест: ${invalidSeats.join(', ')}`;
                    //warningInfoDiv.innerHTML = warningMessage;
                    warningInfoDiv.style.display = 'block';
                    warningInfoDivText.style.display = 'block';
                }
                checkTablePurchaseOffer();
            }

            function checkTablePurchaseOffer() {
                let seatGroups = {};
                let tablePurchaseNeeded = false;

                selectedSeats.forEach(seatId => {
                    let seatData = document.querySelector(`#${seatId}`).getAttribute('data-seat');
                    let match = seatData.match(/Ряд (\d+) Столик (\d+) место (\d+)/);
                    if (!match) return;
                    let [row, table, seat] = match.slice(1).map(Number);
                    let key = `${row}-${table}`;
                    if (!seatGroups[key]) {
                        seatGroups[key] = [];
                    }
                    seatGroups[key].push(seat);
                });

                for (let key in seatGroups) {
                    let seats = seatGroups[key];
                    let [row, table] = key.split('-').map(Number);
                    if (dismissedTables[key]) continue;
                    
                    let remainingSeat = findRemainingSeat();
                    let remainingSeatId = null;
                    if (remainingSeat) {
                        remainingSeatId = `Ряд ${remainingSeat.row} Столик ${remainingSeat.table} место ${remainingSeat.seat}`;
                        seats.push(remainingSeatId);
                    }
            
                    function allSeatsValid(seats) {
                        let isValid = true;
                        let seatElement = document.querySelector(`[data-seat="${remainingSeatId}"]`);
        
                        if (seatElement) {
                            let blocked = seatElement.getAttribute('data-blocked');
                            let remove = seatElement.getAttribute('data-remove');
                            let order = seatElement.getAttribute('data-order');
        
                            //console.log(`Seat ID: ${remainingSeatId}, Blocked: ${blocked}, Remove: ${remove}, Order: ${order}`);
        
                            if (blocked === 'true' || remove === 'true' || order === 'true') {
                                isValid = false;
                            } else {
                                isValid = true;
                            }
                        } else {
                            //console.warn(`Seat element not found for ID: ${remainingSeatId}`);
                            isValid = false; 
                        }
                        return isValid;
                    }
                    
                    if (row === 1 && table === 2) {
                        if (seats.length >= 5 && allSeatsValid(seats)) {
                            tablePurchaseDiv.style.display = 'block';
                            purchaseButtons.style.display = 'flex';
                            yesButton.style.display = 'block';
                            noButton.style.display = 'block';
                            return;
                        }
                    } else {
                        if (seats.length >= 3 && seats.length <= 4) {
                            if (allSeatsValid(seats)) {
                                tablePurchaseDiv.style.display = 'block';
                                purchaseButtons.style.display = 'flex';
                                yesButton.style.display = 'block';
                                noButton.style.display = 'block';
                                return;
                            }
                        }
                    }
                }

                    tablePurchaseDiv.style.display = 'none';
                    purchaseButtons.style.display = 'none';
                    yesButton.style.display = 'none';
                    noButton.style.display = 'none';
            }
            
            yesButton.addEventListener('click', function(e) {
                e.preventDefault();
                let remainingSeat = findRemainingSeat(); 
                if (remainingSeat) {
                    let remainingSeatElement = document.querySelector(`[data-seat="Ряд ${remainingSeat.row} Столик ${remainingSeat.table} место ${remainingSeat.seat}"]`);
                    let key = `${remainingSeat.row}-${remainingSeat.table}`;
                    dismissedTables[key] = true;
                    if (remainingSeatElement) {
                        remainingSeatElement.click();
                    }
                }
                tablePurchaseDiv.style.display = 'none';
                purchaseButtons.style.display = 'none';
                yesButton.style.display = 'none';
                noButton.style.display = 'none';
            });

            noButton.addEventListener('click', function(e) {
                e.preventDefault();
                let remainingSeat = findRemainingSeat();
                if (remainingSeat) {
                    let key = `${remainingSeat.row}-${remainingSeat.table}`;
                    dismissedTables[key] = true;
                }
                tablePurchaseDiv.style.display = 'none';
                purchaseButtons.style.display = 'none';
                yesButton.style.display = 'none';
                noButton.style.display = 'none';
            });

            function findRemainingSeat() {
                let seatGroups = {};

                selectedSeats.forEach(seatId => {
                    let seatData = document.querySelector(`#${seatId}`).getAttribute('data-seat');
                    let match = seatData.match(/Ряд (\d+) Столик (\d+) место (\d+)/);
                    if (!match) {
                        console.error(`Не удалось разобрать данные места: ${seatData}`);
                        return;
                    }
                    let [row, table, seat] = match.slice(1).map(Number);
                    let key = `${row}-${table}`;
                    if (!seatGroups[key]) {
                        seatGroups[key] = [];
                    }
                    seatGroups[key].push(seat);
                });

                for (let key in seatGroups) {
                    let seats = seatGroups[key];

                    if (seats.length === 3 && seats.length <= 4) {
                        let allSeats = [1, 2, 3, 4];
                        let remainingSeat = allSeats.find(seat => !seats.includes(seat));
                        let [row, table] = key.split('-').map(Number);

                        return { row, table, seat: remainingSeat };
                    }

                    if (seats.length === 5 && seats.length <= 6) {
                        let allSeats = [1, 2, 3, 4, 5, 6];
                        let remainingSeat = allSeats.find(seat => !seats.includes(seat));
                        let [row, table] = key.split('-').map(Number);

                        return { row, table, seat: remainingSeat };
                    }
                }

                return null;
            }

            function getInvalidSeats() {
                let seatGroups = {};
                let invalidSeats = [];

                selectedSeats.forEach(seatId => {
                    let seatData = document.querySelector(`#${seatId}`).getAttribute('data-seat');
                    let [row, table, seat] = seatData.match(/Ряд (\d+) Столик (\d+) место (\d+)/).slice(1).map(Number);
                    let key = `${row}-${table}`;
                    if (!seatGroups[key]) {
                        seatGroups[key] = [];
                    }
                    seatGroups[key].push(seat);
                });

                for (let key in seatGroups) {
                    let seats = seatGroups[key];
                    seats.sort((a, b) => a - b);
                    if (seats.length === 1 || seats.length === 3) {
                        invalidSeats.push(`Ряд ${key.split('-')[0]} Столик ${key.split('-')[1]}`);
                    } 
                    else if (seats.length === 2) {
                        if (!(seats[1] === seats[0] + 1)) {
                            invalidSeats.push(`Ряд ${key.split('-')[0]} Столик ${key.split('-')[1]}`);
                        }
                    }
                }

                return invalidSeats;
            }

            function validateSpecificSeats() {
                const shadowTableIndex = 10;
                const shadowMinOrder = minOrderData[shadowTableIndex] || 1;
            
                if (shadowMinOrder !== 2) {
                    return true;
                }
                
                const specificSeats = ['s43', 's44', 's45', 's46'];
                const selectedSpecificSeats = specificSeats.filter(seatId => selectedSeats.includes(seatId));

                if (selectedSpecificSeats.length === 1 || selectedSpecificSeats.length === 3) {
                    let warningInfo = document.getElementById('warning-info-text');
                    if (warningInfo) {
                        warningInfo.style.display = 'block';
                        warningInfo.innerText = `Можно бронировать только по 2 или 4 места на этом столике, места 1 и 2 или 3 и 4.`;
                    }
                    return false;
                } else if (selectedSpecificSeats.length === 2) {
                    const validPairs = [
                        ['s43', 's44'],
                        ['s45', 's46']
                    ];

                    // const isValidPair = validPairs.some(pair => {
                    //     return selectedSpecificSeats.includes(pair[0]) && selectedSpecificSeats.includes(pair[1]);
                    // });

                    const isValidPair = validPairs.some(
                        ([a, b]) => selectedSpecificSeats.includes(a) && selectedSpecificSeats.includes(b)
                    );

                    if (!isValidPair) {
                        let warningInfo = document.getElementById('warning-info-text');
                        if (warningInfo) {
                            warningInfo.style.display = 'block';
                            warningInfo.innerText = `Можно бронировать только по 2 или 4 места на этом столике, места 1 и 2 или 3 и 4.`;
                        }
                        return false;
                    }
                }

                if (selectedSpecificSeats.length === 4) {
                    return true;
                }

                return true;
            }

            function areSeatsValid() {
                let seatGroups = {};
                let totalAvailableSeats = 0;
                let tableAvailableSeats = {};

                let shadowTable = document.querySelector('#additional-table');
                let isShadowTableVisible = shadowTable && shadowTable.getAttribute('data-visible') === 'true';
                
                document.querySelectorAll('.seat').forEach(seat => {
                    let orderStatus = seat.getAttribute('data-order');
                    let blockedStatus = seat.getAttribute('data-blocked');
                    let seatId = parseInt(seat.getAttribute('id').replace(/\D/g, ''));

                    if (!isShadowTableVisible && seatId >= 47 && seatId <= 50) {
                        seat.setAttribute('data-order', 'true');
                        return;
                    }

                    if (!orderStatus && blockedStatus !== 'true') {
                        totalAvailableSeats++;
                        
                        let seatData = seat.getAttribute('data-seat');
                        let match = seatData.match(/Ряд (\d+) Столик (\d+) место (\d+)/);
                        if (match) {
                            let [row, table] = match.slice(1, 3).map(Number);
                            let key = `${row}-${table}`;
                            tableAvailableSeats[key] = (tableAvailableSeats[key] || 0) + 1;
                        }
                    }
                    
                });

                selectedSeats.forEach(seatId => {
                    let seatElement = document.querySelector(`#${seatId}`);
                    if (!seatElement) return;

                    let seatData = seatElement.getAttribute('data-seat');
                    let match = seatData.match(/Ряд (\d+) Столик (\d+) место (\d+)/);
                    if (!match) return;

                    let [row, table, seat] = match.slice(1).map(Number);
                    let key = `${row}-${table}`;

                    if (!isShadowTableVisible && seat >= 47) {
                        return; 
                    }

                    if (!seatGroups[key]) {
                        seatGroups[key] = [];
                    }
                    seatGroups[key].push(seat);
                });
                
                let validTwoSeats = Object.values(tableAvailableSeats).some(seats => seats === 2);
                
                // if (totalAvailableSeats === 2 && selectedSeats.length === 1 && validTwoSeats) {
                //     warningInfoDivText.innerHTML = `Внимание! <br> Осталось только два свободных места, их можно забронировать только парно!`;
                //     warningInfoDiv.style.display = 'block';
                //     warningInfoDivText.style.display = 'block';
                //     return false;
                // }

                if (totalAvailableSeats === 2 && validTwoSeats) {

                    if (selectedSeats.length === 1) {
                        warningInfoDivText.innerHTML = `Внимание! <br> Осталось только два свободных места, их можно забронировать только парно!`;
                        warningInfoDiv.style.display = 'block';
                        warningInfoDivText.style.display = 'block';
                        return false;
                    }

                    return true;
                }

                let invalidSeats = [];
                let isSixSeatTable = false;
                let seatCount = null;
                
                for (let key in seatGroups) {
                    let seats = seatGroups[key].sort((a, b) => a - b);
                    isSixSeatTable = key === "1-2";

                    if (seats.length === 2) {
                        if (isSixSeatTable) {
                            seatCount = 0;
                            let validPairs = [
                                [1, 2],
                                [3, 4],
                                [5, 6]
                            ];

                            let pairValid = validPairs.some(pair => {
                                return seats[0] === pair[0] && seats[1] === pair[1];
                            });

                            if (!pairValid) {
                                invalidSeats.push(`Ряд ${key.split('-')[0]} Столик ${key.split('-')[1]}`);
                                seatCount = 2;
                            }
                        } else {
                            seatCount = 0;
                            let validPairs = [
                                [1, 2],
                                [3, 4]
                            ];

                            let pairValid = validPairs.some(pair => {
                                return seats[0] === pair[0] && seats[1] === pair[1];
                            });

                            if (!pairValid) {
                                invalidSeats.push(`Ряд ${key.split('-')[0]} Столик ${key.split('-')[1]}`);
                                seatCount = 2;
                            }
                        }
                    }

                    if (seats.length === 3) {
                        if (isSixSeatTable) {
                            seatCount = 0;
                            let validTriples = [
                                [1, 2, 3],
                                [4, 5, 6]
                            ];

                            let tripleValid = validTriples.some(triple => {
                                return seats[0] === triple[0] && seats[1] === triple[1] && seats[2] === triple[2];
                            });

                            if (!tripleValid) {
                                invalidSeats.push(`Ряд ${key.split('-')[0]} Столик ${key.split('-')[1]}`);
                                seatCount = 3;
                            }
                        }
                    }
                }

                if (invalidSeats.length > 0) {
                    let seatMessage = '';
                    
                    if (isSixSeatTable && seatCount === 2) {
                        seatMessage = "При бронировании двух мест на данном столике доступны комбинации: 1-2, 3-4, 5-6.";
                    } else if (seatCount === 3 && isSixSeatTable) {
                        seatMessage = "При бронировании трёх мест на данном столике доступны комбинации: 1-3, 4-6.";
                    } else {
                        seatMessage = "При бронировании двух мест на данном столике доступны комбинации: 1-2, 3-4.";
                    }

                    warningInfoDivText.innerHTML = `Внимание! <br> ${seatMessage}`;
                    warningInfoDivText.style.display = 'block';
                    warningInfoDiv.style.display = 'block';
                    let warningMessage = `Ограничение на выбор мест: ${invalidSeats.join(', ')}`;
                    warningInfoDiv.innerHTML = warningMessage;
                    return false;
                }
                
                if (!validateMinOrderTables(seatGroups)) {
                    return false;
                }

                const hasSpecificSeats = selectedSeats.some(id => ['s43', 's44', 's45', 's46'].includes(id));
                if (hasSpecificSeats && !validateSpecificSeats()) {
                    return false;
                }

                return true;
            }

            if (orderNextStepButton) {
                orderNextStepButton.addEventListener('click', function(event) {
                    if (clickInProgress) {
                        event.preventDefault();
                        return;
                    }

                    if (!areSeatsValid()) {
                        event.preventDefault();
                        event.stopPropagation();
                        return; 
                    }

                    // seatsInfoDiv.style.display = 'none';
                    // seatsLayout.style.display = 'none';
                    // infoInputsDiv.style.display = 'block';
                    // paymentSystemDiv.style.display = 'flex';
                });
            }
            if (orderPrevStepButton) {
                orderPrevStepButton.addEventListener('click', function() {
                    // seatsInfoDiv.style.display = 'block';
                    // seatsLayout.style.display = 'block';
                    // infoInputsDiv.style.display = 'none';
                    // paymentSystemDiv.style.display = 'none';
                    updateSeatTotal();
                });
            }

            let clickInProgress = false;

            seats.forEach(seat => {
                seat.addEventListener('click', function(e) {
                if (clickInProgress) return;
                if (seat.getAttribute('data-blocked') === 'false' && seat.getAttribute('data-order') !== 'true' && seat.getAttribute('data-order') !== 'process') {
                        clickInProgress = true;
                        e.preventDefault();
                        
                        let seatId = seat.getAttribute('id');
                        let seatData = seat.getAttribute('data-seat');
                        let seatCategory = seat.getAttribute('data-category');
                        let seatTitle = seat.getAttribute('data-seat');
                        let seatPrice = ticketPrices[seatCategory] || "Цена не указана";
                        let index = selectedSeats.indexOf(seatId);


                        if (index !== -1) {
                            selectedSeats.splice(index, 1);
                            selectedSeatNumber.splice(index, 1);
                            seat.classList.remove('active');
                            removeSeatInfo(seatId);
                        } else {
                            selectedSeats.push(seatId);
                            selectedSeatNumber.push(seatTitle);
                            seat.classList.add('active');
                            let seatInfoDiv = document.createElement('div');

                            seatInfoDiv.className = 'order-item';
                            seatInfoDiv.id = `seat-info-${seatId}`;

                            let formattedPrice = Number(seatPrice).toLocaleString('ru-RU');
                            seatInfoDiv.innerHTML = `
                                ${seatData}, ${formattedPrice} ₽
                            `;

                            let removeButton = document.createElement('button');
                            removeButton.innerHTML = '&times;';
                            removeButton.setAttribute('class', 'remove-seat-button');
                            removeButton.addEventListener('click', function() {
                                removeSeatInfo(seatId);
                                let seat = document.querySelector(`[id='${seatId}']`);
                                if (seat) {
                                    seat.classList.remove('active');
                                    seat.classList.remove('is-selected');
                                }
                                let index = selectedSeats.indexOf(seatId);
                                if (index !== -1) {
                                    selectedSeats.splice(index, 1);
                                    selectedSeatNumber.splice(index, 1);
                                    // document.getElementById('data-ids').value = selectedSeats.join(',');
                                    // document.getElementById('seat-number').value = selectedSeatNumber.join(',');
                                    window.OrderData.seatIds = [...selectedSeats];
                                    window.OrderData.seatNumbers = [...selectedSeatNumber];
                                    updateSeatTotal();
                                }
                            });

                            seatInfoDiv.appendChild(removeButton);
                            document.getElementById('seat-info-container').style.setProperty('display', 'flex', 'important');
                            document.getElementById('seat-info-container').appendChild(seatInfoDiv);
                        }
                        // document.getElementById('data-ids').value = selectedSeats.join(',');
                        // document.getElementById('seat-number').value = selectedSeatNumber.join(',');
                        window.OrderData.seatIds = [...selectedSeats];
                        window.OrderData.seatNumbers = [...selectedSeatNumber];
                        updateSeatTotal();

                        setTimeout(() => {
                            clickInProgress = false; 
                        }, 50);
                    }
                });
                
            });
        }

    function removeSeatInfo(seatId) {
        let seatInfoDiv = document.getElementById(`seat-info-${seatId}`);
        if (seatInfoDiv) {
            seatInfoDiv.remove();
        }
    }

    const eventSeasons = document.querySelector('.event-seasons');
    // const eventSeasonsSpecial = document.querySelector('.event-seasons_special');
    // const eventSeasonsSpecialTitle = document.querySelector('#special_title');
    // const orderForm = document.getElementById('order-event-form');
    const orderTickets = document.getElementById('order-tickets_step');
    const closeButton = document.querySelectorAll('.closeModal-button');

    const buttons = document.querySelectorAll('.event-item_button');
    buttons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            saveScrollPosition(button.closest('.event-item'));
            document.body.classList.add('no-scroll');
        });
    });

    if (orderTickets) {
        orderTickets.addEventListener('click', function() {
            let eventTickets = document.querySelector('#event_tickets_' + modalName);
            if (eventTickets) eventTickets.style.display = 'block';
            if (orderForm) orderForm.style.display = 'none';
            resetOrderData();
        });
    }

    closeButton.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e && e.preventDefault && e.preventDefault();
            closeCurrentModal();
            resetOrderData();
        });
    });

    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('.close_management-tickets');
        if (closeBtn) {
            e.preventDefault();
            closeCurrentModal();
            resetOrderData();
        }
    });

    function resetOrderData() {
        document.querySelectorAll('.seat.active').forEach(seat => {
            seat.classList.remove('is-selected');
            seat.classList.remove('active');
            seat.removeAttribute('data-order');
        });

        let orderInputs = document.querySelectorAll('#order-event-form input');
        orderInputs.forEach(input => {
            if (input.id !== 'submit-order' && input.id !== 'submit-code') {
                if (input.type === 'checkbox' && input.name === 'confirm_agree') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            }
        });

        let orderItems = document.querySelectorAll('.order-item');
        orderItems.forEach(item => {
            item.remove();
        });
        document.getElementById('seat-info-container').style.removeProperty('display');

        selectedSeats = [];
        selectedSeatNumber = [];

        window.OrderData.orderNumber = "";
        window.OrderData.total = 0;
        window.OrderData.ticketsCount = 0;
        window.OrderData.seatNumbers = [];
        window.OrderData.seatIds = [];
        window.OrderData.amountSale = 0;

        let seatTotalDiv = document.querySelector('.seat-total');
        let tablePurchaseDiv = document.getElementById('table-purchase'); 
        let yesButton = document.getElementById('purchase-yes');
        let noButton = document.getElementById('purchase-no');
        let orderNextStepButton = document.getElementById('order-next_step');
        let seatsInfoDiv = document.querySelector('.order-info');
        let seatsLayout = document.querySelector('.seat-layout');
        let infoInputsDiv = document.querySelector('.info-inputs');
        let paymentSystemDiv = document.querySelector('.payment-system');
        let purchaseButtons = document.getElementById('purchase-buttons');
        if (seatTotalDiv) {
            seatTotalDiv.innerHTML = 'Вы выбрали 0 билетов на сумму 0 ₽';
        }

        if (orderNextStepButton) {
            // orderNextStepButton.style.display = 'none';
            orderNextStepButton.classList.remove('active');
        }

        if (orderForm) orderForm.style.display = 'none';
        disableModalZoomLock();
        document.body.classList.remove('no-scroll');
        if (tablePurchaseDiv) tablePurchaseDiv.style.display = 'none';
        if (purchaseButtons) purchaseButtons.style.display = 'none';
        if (yesButton) yesButton.style.display = 'none';
        if (noButton) noButton.style.display = 'none';
        // infoInputsDiv.style.display = 'none';
        // paymentSystemDiv.style.display = 'none';
        // seatsLayout.style.display = 'block';
        // seatsInfoDiv.style.display = 'block';
        
        updateButtonOpacity();
    }

    var categoriesData, blockedData, removeData, shadowTableData, ticketPrices, minOrderData = [];

    function setupEventListItemClickHandler() {
        const eventListItems = document.querySelectorAll('.event_list-item');
        const eventIdInput = document.getElementById('event-id');

        eventListItems.forEach(item => {
            item.addEventListener('click', function(event) {
                event.preventDefault();
                const eventId = this.dataset.id;
                if (eventIdInput) eventIdInput.value = eventId;
                $('#loader').css('display', 'flex');

                fetch(`/api/handler?action=get_event_details&event_id=${eventId}`)
                    .then(response => response.json())
                    .then(data => {
                        //console.log(data);
                        const seatData = data.seat_data;
                        const seats = document.querySelectorAll('.seat');
                        seats.forEach(seat => {
                            const seatNumber = seat.id.replace('s', '');
                            const seatKey = `seat_${seatNumber}`;
                            
                            if (seatData[seatKey] !== undefined) {
                                seat.setAttribute('data-order', seatData[seatKey]);
                            }
                        });
                        categoriesData = data.categories;
                        blockedData = data.blocked;
                        removeData = data.remove;
                        shadowTableData = data.shadow_table;
                        ticketPrices = data.ticket_prices;
                        
                        minOrderData = data.min_order ? data.min_order.split(',').map(item => { const num = parseInt(item, 10); return num === 2 ? 2 : 1;}) : [];

                        updateSeatAttributes();
                        updateSeatDisplay();
                        updateTableOpacity();
                        displayTicketPrices(ticketPrices);
                        $('#loader').hide();
                    })
                    .catch(error => console.error('Error:', error));
            });
        });
    }

    function displayTicketPrices(ticketPrices) {
        const container = document.querySelector('.ticket-categories-price');
        container.innerHTML = ''; 

        for (const category in ticketPrices) {
            if (ticketPrices[category] && ticketPrices[category] !== '') {
                const label = document.createElement('label');
                const circle = document.createElement('div');
                circle.className = 'category_circle';
                circle.setAttribute('data-category', category);

                label.appendChild(circle);
                let price = Number(ticketPrices[category]).toLocaleString('ru-RU');
                label.innerHTML += `<span>${price} ₽</span>`;

                container.appendChild(label);
            }
        }
    }

    function updateSeatAttributes() {
        if (categoriesData && blockedData && removeData) {
    
            const seats = Array.from(document.querySelectorAll('.seat'));
            const minSeatNumber = Math.min(...seats.map(el => parseInt(el.id.replace('s', ''), 10)));
    
            seats.forEach(function(element) {
    
                const seatNumber = parseInt(element.id.replace('s', ''), 10);
                const index = seatNumber - minSeatNumber;
    
                if (categoriesData[index] !== undefined) {
                    element.setAttribute('data-category', categoriesData[index]);
                }
                if (blockedData[index] !== undefined) {
                    element.setAttribute('data-blocked', blockedData[index]);
                }
                if (removeData[index] !== undefined) {
                    element.setAttribute('data-remove', removeData[index]);
                }
    
            });
    
            const elementTable = document.querySelector('#additional-table');
            if (elementTable && shadowTableData[0] !== undefined) {
                elementTable.setAttribute('data-visible', shadowTableData[0]);
            }
        }
    }

    function updateSeatDisplay() {
        document.querySelectorAll('.seat').forEach(function(seat) {
            if (seat.getAttribute('data-blocked') === 'true') {
                seat.classList.add('blocked');
            } else {
                seat.classList.remove('blocked');
            }
            if (seat.getAttribute('data-remove') === 'true') {
                seat.classList.add('inactive');
            } else {
                seat.classList.remove('inactive');
            }
            if (seat.getAttribute('data-order') === 'true') {
                seat.classList.add('ordered');
            } else {
                seat.classList.remove('ordered');
            }
            if (seat.getAttribute('data-order') === 'process') {
                seat.classList.add('process');
            } else {
                seat.classList.remove('process');
            }
        });

        const table = document.querySelector('#additional-table');
        const secondSeatTable = document.querySelector('#second-seat');
        if (table && table.getAttribute('data-visible') === 'true') {
            table.classList.add('visible');
            secondSeatTable.classList.add('additional-moved');
            
        } else {
            table.classList.remove('visible');
            secondSeatTable.classList.remove('additional-moved');
        }

        checkVisibility();
    }

    function updateTableOpacity() {
        const tableElements = document.querySelectorAll('.circle-container');
        
        tableElements.forEach((tableElement) => {
            const seatsInTable = tableElement.querySelectorAll('.seat');
            let allRemoved = true;

            seatsInTable.forEach(seat => {
                if (seat.getAttribute('data-remove') !== 'true') {
                    allRemoved = false;
                }
            });

            if (allRemoved && seatsInTable.length > 0) {
                tableElement.style.opacity = '0';
            } else {
                tableElement.style.opacity = '1';
            }
        });
    }

    function checkVisibility() {
        var shadowTable = document.getElementById('additional-table');
        
        if (shadowTable.getAttribute('data-visible') === "false") {
            shadowTable.style.display = 'none';
        } else {
            shadowTable.style.display = 'block'; 
        }
    }

    // function updateEventItems() {
    //     eventSeasons.innerHTML = '';
    //     // eventSeasonsSpecial.innerHTML = '';

    //     const currentYear = new Date().getFullYear();          

    //     // monthsData.forEach(monthData => {
    //     //     const eventDate = new Date(monthData.event_date);
    //     //     const eventDateMonth = new Date(monthData.month);
    //     //     const eventDay = eventDate.getDate();
    //     //     const eventMonth = eventDate.getMonth();
    //     //     const eventYear = eventDate.getFullYear();
            
    //     //     // eventSeasonsSpecialTitle.style.display = "none";
    //     //     // const eventItem = createEventItem(monthData);
    //     //     eventSeasons.appendChild(eventItem);

    //     //     // const eventTickets = createEventTickets(monthData);
    //     //     document.body.appendChild(eventTickets);

    //     //     // loadEventsList(eventTickets, monthData.month, monthData.year);
    //     // });
    // }

    // updateEventItems();
    
    function getTableIndexByRowAndTable(row, table) {
        const tableOrderMap = {
            '1-1': 0,
            '1-2': 1,
            '1-3': 2,
            '2-1': 3,
            '2-2': 4,
            '2-3': 5,
            '3-1': 6,
            '3-2': 7,
            '4-1': 8,
            '4-2': 9,
            '5-1': 10,
            '2-4': 11
        };
    
        const key = `${row}-${table}`;
        return tableOrderMap[key] ?? -1;
    }
    
    function validateMinOrderTables(seatGroups) {
        for (let key in seatGroups) {
            const seats = seatGroups[key];
            const [row, table] = key.split('-').map(Number);
    
            const tableIndex = getTableIndexByRowAndTable(row, table);
            if (tableIndex === -1) {
                continue;
            }
    
            const minOrder = minOrderData[tableIndex] || 1;
            const warningInfoDivText = document.getElementById('warning-info-text');
            const warningInfoDiv = document.getElementById('warning-info');
            
            if (minOrder !== 2) {
                continue;
            }
            
            const isSixSeatTable = key === '1-2';
            
            let valid = false;
            
            if (seats.length === 2) {
                const validPairs = isSixSeatTable
                    ? [[1, 2], [3, 4], [5, 6]]
                    : [[1, 2], [3, 4]];
    
                valid = validPairs.some(pair =>
                    seats[0] === pair[0] && seats[1] === pair[1]
                );
            } else if (seats.length === 4) {
                valid =
                    (seats[0] === 1 && seats[1] === 2 && seats[2] === 3 && seats[3] === 4) ||
                    (isSixSeatTable && seats[0] === 3 && seats[1] === 4 && seats[2] === 5 && seats[3] === 6);
            } else if (isSixSeatTable && seats.length === 6) {
                valid =
                    seats[0] === 1 &&
                    seats[1] === 2 &&
                    seats[2] === 3 &&
                    seats[3] === 4 &&
                    seats[4] === 5 &&
                    seats[5] === 6;
            }
            
            if (!valid) {
                warningInfoDivText.style.display = 'block';
                warningInfoDivText.innerHTML =
                    `Внимание! <br> За данным столиком можно забронировать минимум по 2 парных места.`;
    
                warningInfoDiv.style.display = 'block';
                warningInfoDiv.innerHTML = `Ограничение на выбор мест: Ряд ${row} Столик ${table}`;
    
                return false;
            }
    
            // if (minOrder === 2 && seats.length === 1) {
            //     warningInfoDivText.style.display = 'block';
            //     warningInfoDivText.innerHTML = `Внимание! <br> За данным столиком минимальное бронирование  - 2 места.`;
            //     warningInfoDiv.style.display = 'block';
            //     warningInfoDiv.innerHTML = `Ограничение на выбор мест: Ряд ${row} Столик ${table}`;
            //     return false;
            // }
        }
    
        return true;
    }
});


// Append backdrop handler






document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
        if (typeof window.closeOrderMessengerModal === 'function') {
            window.closeOrderMessengerModal();
        }
        const openModal = document.querySelector('.event_tickets');
        const orderForm = document.getElementById('order-event-form');
        if (openModal || (orderForm && orderForm.style.display === 'flex')) {
            if (typeof window.closeShowModal === 'function') {
                window.closeShowModal();
            } else if (openModal) {
                openModal.style.setProperty('display', 'none', 'important');
                try { openModal.remove(); } catch(err) {}
                document.body.classList.remove('no-scroll');
            }
        }
    }
});

function handleOutsideModalClick(e) {
    if (Date.now() - (window._lastModalOpenTime || 0) < 400) return;
    if (e.target.closest('#order-messenger-modal, .order-messenger-modal-overlay, .order-messenger-modal-card')) return;
    const openModal = document.querySelector('.event_tickets');
    if (!openModal) return;
    if (e.target.closest('.event-item')) return;
    if (e.target.closest('.event-item_button')) return;
    if (e.target.closest('.event_tickets')) return;
    if (e.target.closest('#order-event-form')) return;
    if (e.target.closest('.event_tickets_overlay')) return;
    if (typeof window.closeShowModal === 'function') {
        window.closeShowModal();
    }
}
document.addEventListener('click', handleOutsideModalClick);
document.addEventListener('touchend', handleOutsideModalClick);
