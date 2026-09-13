const fs = require('fs');

let seats = fs.readFileSync('seats.js', 'utf8');

const targetVideoRender = `        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.url;
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain';
            mainDisplay.appendChild(video);`;

const replacementVideoRender = `        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.url;
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            mainDisplay.appendChild(video);`;

if (seats.includes(targetVideoRender)) {
    seats = seats.replace(targetVideoRender, replacementVideoRender);
    fs.writeFileSync('seats.js', seats);
    console.log('Video objectFit changed to cover');
} else {
    console.log('Target not found');
}
