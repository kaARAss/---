const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

seats = seats.replace(/video\.style\.height = '100%';/g, "video.style.height = 'auto';");
seats = seats.replace(/img\.style\.height = '100%';/g, "img.style.height = 'auto';");

fs.writeFileSync('seats.js', seats);
console.log('Fixed media sizing');
