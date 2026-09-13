const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove my previous hover fix
html = html.replace(/\/\* Disable hover animation on mobile banner \*\/[\s\S]*?\/\* Desktop fixes for thumbs wrapper \*\//, '/* Desktop fixes for thumbs wrapper */');

fs.writeFileSync('index.html', html);
console.log('Removed manual hover fallback from html');
