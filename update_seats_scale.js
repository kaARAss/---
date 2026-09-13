const fs = require('fs');

let seatsJs = fs.readFileSync('seats.js', 'utf8');

const targetStr = `imgBg.style.objectFit = 'cover';
            imgBg.style.objectPosition = 'left center'; // Align to left so text isn't cut off
            imgBg.style.transform = 'scale(1.08)'; // Zoom in slightly to make text more readable/larger
            imgBg.style.transformOrigin = 'left center'; // Keep the left side anchored while zooming`;

const replacementStr = `imgBg.style.objectFit = 'cover';
            if (monthData.image.includes('show2')) {
                imgBg.style.objectPosition = 'left center';
                imgBg.style.transform = 'scale(1.08)';
                imgBg.style.transformOrigin = 'left center';
            } else {
                imgBg.style.objectPosition = 'center';
                imgBg.style.transform = 'none';
            }`;

seatsJs = seatsJs.replace(targetStr, replacementStr);
fs.writeFileSync('seats.js', seatsJs);
console.log('Fixed object scale for specific images in seats.js');
