const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');
css += `\n.red_button { text-align: center; }\n`;
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += '.red_button{text-align:center}';
fs.writeFileSync('style.min.css', mincss);

console.log('Added text-align center');
