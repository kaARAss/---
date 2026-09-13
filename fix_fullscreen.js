const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

seats = seats.replace("fullscreenImg.style.maxWidth = '95%';", "fullscreenImg.style.maxWidth = '100%';");
seats = seats.replace("fullscreenImg.style.maxHeight = '95%';", "fullscreenImg.style.maxHeight = '100%';");

fs.writeFileSync('seats.js', seats);
