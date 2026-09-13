const fs = require('fs');

let seats = fs.readFileSync('seats.js', 'utf8');

const targetCreateThumb = `    const createThumb = (text, isVideo, bgUrl) => {
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
        t.style.overflow = 'hidden';`;

const replacementCreateThumb = `    const createThumb = (text, isVideo, bgUrl) => {
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
        
        t.onmouseenter = () => {
            t.style.borderColor = '#8b1014';
            t.style.transform = 'scale(1.05)';
        };
        t.onmouseleave = () => {
            t.style.borderColor = t.style.borderWidth === '2px' ? (t.style.borderColor === 'rgb(139, 16, 20)' || t.style.borderColor === '#8b1014' ? '#444' : t.style.borderColor) : '#444';
            t.style.transform = 'scale(1)';
        };`;

if (seats.includes(targetCreateThumb)) {
    seats = seats.replace(targetCreateThumb, replacementCreateThumb);
}

const targetVideo = `                const vid = document.createElement('video');
                vid.src = bgUrl + "#t=0.1"; // Load first frame
                vid.style.position = 'absolute';
                vid.style.top = '0';
                vid.style.left = '0';
                vid.style.width = '100%';
                vid.style.height = '100%';
                vid.style.objectFit = 'cover';
                vid.muted = true;
                vid.preload = 'metadata';
                t.appendChild(vid);`;

const replacementVideo = `                const vid = document.createElement('video');
                vid.src = bgUrl;
                vid.style.position = 'absolute';
                vid.style.top = '0';
                vid.style.left = '0';
                vid.style.width = '100%';
                vid.style.height = '100%';
                vid.style.objectFit = 'cover';
                vid.muted = true;
                vid.playsInline = true;
                vid.preload = 'metadata';
                vid.onloadedmetadata = () => {
                    vid.currentTime = 1; // Seek to 1 second to ensure a frame is loaded
                };
                t.appendChild(vid);`;

if (seats.includes(targetVideo)) {
    seats = seats.replace(targetVideo, replacementVideo);
}

fs.writeFileSync('seats.js', seats);
console.log('Done fixing hover and video');
