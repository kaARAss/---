const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// Also make sure grid cells are vertically centered
if (!css.includes('footer .footer_section .footer_block {')) {
    css += `
footer .footer_section .footer_block {
    justify-content: center !important;
}
`;
} else {
    css = css.replace('justify-content: flex-end;', 'justify-content: center !important;');
}

fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss = mincss.replace('footer .footer_section .footer_block{justify-content:flex-end}', 'footer .footer_section .footer_block{justify-content:center!important}');
fs.writeFileSync('style.min.css', mincss);

console.log('Centered footer block vertically');
