const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<img src="./logo.png" alt="logo footer" style="height: 100px;', '<img src="./logo.png" alt="logo footer" style="height: 60px;');
fs.writeFileSync('index.html', html);
console.log('Fixed inline logo height');
