const fs = require('fs');

let seatsJs = fs.readFileSync('seats.js', 'utf8');

// Replace the inline style block for custom images
const targetStr = `imgBg.style.position = 'absolute';
            imgBg.style.top = '0';
            imgBg.style.left = '0';
            imgBg.style.width = '100%';
            imgBg.style.height = '100%';
            imgBg.style.objectFit = 'cover';
            imgBg.style.transform = 'none';`;

const replacementStr = `imgBg.style.position = 'absolute';
            imgBg.style.top = '0';
            imgBg.style.left = '0';
            imgBg.style.width = '100%';
            imgBg.style.height = '100%';
            imgBg.style.objectFit = 'cover';
            imgBg.style.objectPosition = 'left center'; // Align to left so text isn't cut off
            imgBg.style.transform = 'none';`;

seatsJs = seatsJs.replace(targetStr, replacementStr);
fs.writeFileSync('seats.js', seatsJs);
console.log('Fixed object position in seats.js');
