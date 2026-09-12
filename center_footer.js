const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

if (!css.includes('.section_up {')) {
    css += `
footer .footer_section .section_up {
    align-items: center !important;
}
`;
} else {
    css = css.replace('align-items: end !important;', 'align-items: center !important;');
}

fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss = mincss.replace('footer .footer_section .section_up{align-items:end!important}', 'footer .footer_section .section_up{align-items:center!important}');
fs.writeFileSync('style.min.css', mincss);

console.log('Centered footer vertically');
