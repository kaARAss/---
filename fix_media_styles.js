const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

// 1. Remove background and border from mainFrame
seats = seats.replace("mainFrame.style.backgroundColor = 'rgba(0,0,0,0.8)';", "mainFrame.style.backgroundColor = 'transparent';");
seats = seats.replace("mainFrame.style.border = '1px solid #333';", "mainFrame.style.border = 'none';");
seats = seats.replace("mainFrame.style.borderRadius = '12px';", ""); // We'll put radius on the media

// 2. Fix video render
const targetVideo = `        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.url;
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            mainDisplay.appendChild(video);`;

const replacementVideo = `        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.url;
            video.controls = true;
            video.style.maxWidth = '100%';
            video.style.maxHeight = '100%';
            video.style.width = 'auto';
            video.style.height = '100%';
            video.style.objectFit = 'contain';
            video.style.borderRadius = '12px';
            video.style.border = '1px solid #333';
            video.style.backgroundColor = 'rgba(0,0,0,0.8)';
            mainDisplay.appendChild(video);`;
            
if(seats.includes(targetVideo)) {
    seats = seats.replace(targetVideo, replacementVideo);
}

// 3. Fix image render
const targetImg = `        } else {
            const img = document.createElement('img');
            img.src = item.url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover'; // Растягиваем на все окно
            img.style.cursor = 'pointer'; // Добавляем курсор`;

const replacementImg = `        } else {
            const img = document.createElement('img');
            img.src = item.url;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.width = 'auto';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '12px';
            img.style.border = '1px solid #333';
            img.style.backgroundColor = 'rgba(0,0,0,0.8)';
            img.style.cursor = 'pointer';`;

if(seats.includes(targetImg)) {
    seats = seats.replace(targetImg, replacementImg);
}

fs.writeFileSync('seats.js', seats);
console.log('Fixed media styles');
