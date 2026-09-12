const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// fix height
css = css.replace('padding: 80px 5% !important;', 'padding: 40px 5% !important;');

// Ensure footer_block is flex column
if (!css.includes('.footer_section .footer_block {')) {
    css += `\n.footer_section .footer_block {\n    display: flex;\n    flex-direction: column;\n    gap: 12px;\n}\n`;
}

fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss = mincss.replace('padding:80px 5%!important', 'padding:40px 5%!important');
mincss += '.footer_section .footer_block{display:flex;flex-direction:column;gap:12px}';
fs.writeFileSync('style.min.css', mincss);

console.log('Fixed footer CSS');
