const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');
css = css.replace(/\.banner_image:hover\s*{[^}]*}/g, '');
fs.writeFileSync('style.css', css);

let minCss = fs.readFileSync('style.min.css', 'utf8');
minCss = minCss.replace(/\.banner_image:hover\s*{[^}]*}/g, '');
fs.writeFileSync('style.min.css', minCss);

console.log('Removed hover from css files');
