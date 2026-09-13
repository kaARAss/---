const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

seats = seats.replace("t.style.transform = 'scale(1.05)';", "");
seats = seats.replace("t.style.transform = 'scale(1)';", "");

fs.writeFileSync('seats.js', seats);
console.log('Thumb zoom removed');
