const fs = require('fs');

let seatsJs = fs.readFileSync('seats.js', 'utf8');

const targetStr = `imgBg.style.objectPosition = 'left center'; // Align to left so text isn't cut off
            imgBg.style.transform = 'none';`;

// Let's use scale to slightly zoom in the image
const replacementStr = `imgBg.style.objectPosition = 'left center'; // Align to left so text isn't cut off
            imgBg.style.transform = 'scale(1.08)'; // Zoom in slightly to make text more readable/larger
            imgBg.style.transformOrigin = 'left center'; // Keep the left side anchored while zooming`;

seatsJs = seatsJs.replace(targetStr, replacementStr);
fs.writeFileSync('seats.js', seatsJs);
console.log('Fixed object scale in seats.js');
