const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/href="\.\/style\.min\.css"/, 'href="./style.min.css?v=' + Date.now() + '"');
html = html.replace(/href="\.\/style\.css"/, 'href="./style.css?v=' + Date.now() + '"');

fs.writeFileSync('index.html', html);
console.log('Cache bust added');
