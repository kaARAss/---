const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

const targetImg = `        } else {
            const img = document.createElement('img');
            img.src = item.url;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.width = 'auto';
            img.style.height = 'auto';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '12px';
            img.style.border = '1px solid #333';
            img.style.backgroundColor = 'rgba(0,0,0,0.8)';
            img.style.cursor = 'pointer';`;

const replacementImg = `        } else {
            const img = document.createElement('img');
            img.src = item.url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '12px';
            img.style.border = '1px solid #333';
            img.style.backgroundColor = 'rgba(0,0,0,0.8)';
            img.style.cursor = 'pointer';`;

if(seats.includes(targetImg)) {
    seats = seats.replace(targetImg, replacementImg);
    fs.writeFileSync('seats.js', seats);
    console.log('Restored cover for img in main display');
} else {
    console.log('Target not found');
}
