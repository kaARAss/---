const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

seats = seats.replace("img.onerror = () => { img.style.display = 'none'; };", "img.onerror = () => { img.style.display = 'none'; mainDisplay.textContent = 'Здесь будет большое фото'; };");

fs.writeFileSync('seats.js', seats);
