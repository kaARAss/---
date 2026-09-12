const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');
css = css.replace(".red_button {\n    text-align: center;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n}\n", "");
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss = mincss.replace(".red_button{text-align:center;display:inline-flex;align-items:center;justify-content:center}", "");
fs.writeFileSync('style.min.css', mincss);

console.log('Removed global inline-flex on red button');
