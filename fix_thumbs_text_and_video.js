const fs = require('fs');

let seatsJs = fs.readFileSync('seats.js', 'utf8');

const targetThumb = `    const createThumb = (text, isVideo, bgUrl) => {
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
                const vid = document.createElement('video');
                vid.src = bgUrl + "#t=0.1"; // Load first frame
                vid.style.position = 'absolute';
                vid.style.top = '0';
                vid.style.left = '0';
                vid.style.width = '100%';
                vid.style.height = '100%';
                vid.style.objectFit = 'cover';
                vid.muted = true;
                vid.preload = 'metadata';
                t.appendChild(vid);
                
                // Add play icon overlay without text
                t.innerHTML += \`<span style="position: relative; z-index: 2; font-size: 24px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">▶</span>\`;
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
                 t.appendChild(bg);
            }
        } else {
            t.textContent = text;
            if (isVideo) {
                t.innerHTML = \`<span style="font-size: 24px;">▶</span>\`;
            }
        }
        
        return t;
    };`;

seatsJs = seatsJs.replace(targetThumb, replacementThumb);

fs.writeFileSync('seats.js', seatsJs);
console.log('Fixed thumbnails text and video preview');
