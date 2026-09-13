const fs = require('fs');

let seatsJs = fs.readFileSync('seats.js', 'utf8');

// 1. Update createThumb to accept background image url
const targetThumb = `    const createThumb = (text, isVideo) => {
        const t = document.createElement('div');
        t.style.width = '100%';
        t.style.height = '90px';
        t.style.backgroundColor = 'rgba(0,0,0,0.5)';
        t.style.display = 'flex';
        t.style.alignItems = 'center';
        t.style.justifyContent = 'center';
        t.style.cursor = 'pointer';
        t.style.borderRadius = '8px';
        t.style.border = '2px solid #444';
        t.style.color = '#fff';
        t.style.fontFamily = 'Onest, sans-serif';
        t.style.fontSize = '14px';
        t.style.flexShrink = '0';
        t.style.transition = 'all 0.3s ease';
        t.textContent = text;
        if (isVideo) {
            t.innerHTML = \`▶ \${text}\`;
        }
        return t;
    };`;

const replacementThumb = `    const createThumb = (text, isVideo, bgUrl) => {
        const t = document.createElement('div');
        t.style.width = '100%';
        t.style.height = '90px';
        t.style.backgroundColor = 'rgba(0,0,0,0.8)';
        t.style.display = 'flex';
        t.style.alignItems = 'center';
        t.style.justifyContent = 'center';
        t.style.cursor = 'pointer';
        t.style.borderRadius = '8px';
        t.style.border = '2px solid #444';
        t.style.color = '#fff';
        t.style.fontFamily = 'Onest, sans-serif';
        t.style.fontSize = '14px';
        t.style.flexShrink = '0';
        t.style.transition = 'all 0.3s ease';
        t.style.position = 'relative';
        t.style.overflow = 'hidden';
        
        if (bgUrl && bgUrl !== '') {
            if (isVideo) {
                 // For video thumbnail we can just use a dark gradient or the same bg logic
                 t.innerHTML = \`<span style="position: relative; z-index: 2; font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">▶ \${text}</span>\`;
            } else {
                 const bg = document.createElement('div');
                 bg.style.position = 'absolute';
                 bg.style.top = '0';
                 bg.style.left = '0';
                 bg.style.width = '100%';
                 bg.style.height = '100%';
                 bg.style.backgroundImage = \`url('\${bgUrl}')\`;
                 bg.style.backgroundSize = 'cover';
                 bg.style.backgroundPosition = 'center';
                 bg.style.opacity = '0.7';
                 t.appendChild(bg);
                 t.innerHTML += \`<span style="position: relative; z-index: 2; font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">\${text}</span>\`;
            }
        } else {
            t.textContent = text;
            if (isVideo) {
                t.innerHTML = \`▶ \${text}\`;
            }
        }
        
        return t;
    };`;

seatsJs = seatsJs.replace(targetThumb, replacementThumb);

// 2. Fix the caller to pass url
const targetLoop = `    mediaItems.forEach((item, i) => {
        const thumb = createThumb(item.label, item.type === 'video');`;
        
const replacementLoop = `    mediaItems.forEach((item, i) => {
        const thumb = createThumb(item.label, item.type === 'video', item.url);`;
        
seatsJs = seatsJs.replace(targetLoop, replacementLoop);

// 3. Fix main photo size (objectFit: cover instead of contain) and Fullscreen click
const targetRenderMedia = `    function renderMedia(item) {
        mainDisplay.innerHTML = '';
        if (!item.url) {
            mainDisplay.textContent = 'Здесь будет большое ' + (item.type === 'video' ? 'видео' : 'фото');
            return;
        }
        
        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.url;
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain';
            mainDisplay.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            mainDisplay.appendChild(img);
        }
    }`;
    
const replacementRenderMedia = `    function renderMedia(item) {
        mainDisplay.innerHTML = '';
        if (!item.url) {
            mainDisplay.textContent = 'Здесь будет большое ' + (item.type === 'video' ? 'видео' : 'фото');
            return;
        }
        
        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.url;
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain';
            mainDisplay.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover'; // Растягиваем на все окно
            img.style.cursor = 'pointer'; // Добавляем курсор
            
            // Клик для открытия на полный экран
            img.addEventListener('click', () => {
                const fullscreenBg = document.createElement('div');
                fullscreenBg.style.position = 'fixed';
                fullscreenBg.style.top = '0';
                fullscreenBg.style.left = '0';
                fullscreenBg.style.width = '100vw';
                fullscreenBg.style.height = '100vh';
                fullscreenBg.style.backgroundColor = 'rgba(0,0,0,0.95)';
                fullscreenBg.style.zIndex = '100000';
                fullscreenBg.style.display = 'flex';
                fullscreenBg.style.alignItems = 'center';
                fullscreenBg.style.justifyContent = 'center';
                fullscreenBg.style.cursor = 'zoom-out';
                
                const fullscreenImg = document.createElement('img');
                fullscreenImg.src = item.url;
                fullscreenImg.style.maxWidth = '95%';
                fullscreenImg.style.maxHeight = '95%';
                fullscreenImg.style.objectFit = 'contain';
                fullscreenImg.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';
                
                fullscreenBg.appendChild(fullscreenImg);
                document.body.appendChild(fullscreenBg);
                
                fullscreenBg.addEventListener('click', () => {
                    fullscreenBg.remove();
                });
            });
            
            mainDisplay.appendChild(img);
        }
    }`;

seatsJs = seatsJs.replace(targetRenderMedia, replacementRenderMedia);


fs.writeFileSync('seats.js', seatsJs);
console.log('Fixed thumbnails background and image fit/fullscreen');
