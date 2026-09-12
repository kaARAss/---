const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

css = css.replace('margin-bottom: 12px !important;', 'margin-bottom: 6px !important;');

fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += 'footer .footer_section .footer_block a{margin-bottom:6px!important}';
fs.writeFileSync('style.min.css', mincss);
console.log('Fixed footer a margin');
