const fs = require('fs');

let seatsJs = fs.readFileSync('seats.js', 'utf8');

const targetStr = `            if (monthData.image.includes('show2')) {
                imgBg.style.objectPosition = 'left center';
                imgBg.style.transform = 'scale(1.08)';
                imgBg.style.transformOrigin = 'left center';
            } else {
                imgBg.style.objectPosition = 'center';
                imgBg.style.transform = 'none';
            }`;

const replacementStr = `            if (monthData.image.includes('show2')) {
                imgBg.style.objectPosition = 'left center';
                imgBg.style.transform = 'scale(1.08)';
                imgBg.style.transformOrigin = 'left center';
            } else if (monthData.image.includes('show3')) {
                imgBg.style.objectPosition = 'center 35%'; // Сдвигает содержимое картинки чуть ниже
                imgBg.style.transform = 'none';
            } else {
                imgBg.style.objectPosition = 'center';
                imgBg.style.transform = 'none';
            }`;

seatsJs = seatsJs.replace(targetStr, replacementStr);
fs.writeFileSync('seats.js', seatsJs);
console.log('Fixed object position for show3 in seats.js');
