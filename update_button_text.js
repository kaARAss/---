const fs = require('fs');

let js = fs.readFileSync('seats.js', 'utf8');
js = js.replace("button.textContent = 'Билеты';", "button.textContent = 'Подробнее';");

fs.writeFileSync('seats.js', js);
console.log('Updated button text');
