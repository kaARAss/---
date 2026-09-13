const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

seats = seats.replace("img.style.objectFit = 'cover';", "img.style.objectFit = 'contain';\n            img.style.maxWidth = '100%';\n            img.style.maxHeight = '100%';\n            img.style.width = 'auto';\n            img.style.height = 'auto';");
fs.writeFileSync('seats.js', seats);
