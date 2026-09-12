const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// The user wants to push the text sections lower, closer to the hr or bottom. 
// Right now, .section_up has display:grid. 
// We can set align-items: end; to push text down inside the grid cells.
if (!css.includes('.section_up {')) {
    css += `
footer .footer_section .section_up {
    align-items: end;
}
`;
} else {
    css += `\nfooter .footer_section .section_up { align-items: end !important; }\n`;
}

// Ensure the footer block itself isn't pulling things up
css += `
footer .footer_section .footer_block {
    justify-content: flex-end;
}
`;

fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += 'footer .footer_section .section_up{align-items:end!important}footer .footer_section .footer_block{justify-content:flex-end}';
fs.writeFileSync('style.min.css', mincss);

console.log('Aligned footer text lower');
