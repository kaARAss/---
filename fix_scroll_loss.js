const fs = require('fs');
let js = fs.readFileSync('seats.js', 'utf8');

js = js.replace(/display: none !important;/g, "visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; transition: opacity 0.3s ease;");

fs.writeFileSync('seats.js', js);
console.log('Fixed scroll position loss by using visibility instead of display');
