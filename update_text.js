const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

seats = seats.replace(/title\.textContent = 'НАЗВАНИЕ ШОУ';/g, "title.textContent = 'НАЗВАНИЕ ШОУ';");
seats = seats.replace(/subtitle\.textContent = monthText;/g, "subtitle.textContent = 'ОПИСАНИЕ ШОУ';");

fs.writeFileSync('seats.js', seats);
