const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('width: 140px !important;', 'width: auto !important;');

fs.writeFileSync('index.html', html);
console.log('Fixed desktop arrow width');
