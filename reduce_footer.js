const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

css = css.replace('padding: 40px 5% !important;', 'padding: 20px 5% 10px 5% !important;');

if (!css.includes('footer .footer_section .section_up {')) {
    css += `
footer .footer_section .section_up, footer .footer_section .section_down {
    margin-bottom: 16px !important;
}
footer .footer_section .first_footer_block img[alt="logo footer"] {
    height: 60px !important;
    margin-bottom: 10px !important;
}
`;
} else {
    // If it exists, let's just append an override to the end
    css += `
footer .footer_section .section_up, footer .footer_section .section_down {
    margin-bottom: 16px !important;
}
footer .footer_section .first_footer_block img[alt="logo footer"] {
    height: 60px !important;
    margin-bottom: 10px !important;
}
`;
}

fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss = mincss.replace('padding:40px 5%!important', 'padding:20px 5% 10px 5%!important');
mincss += 'footer .footer_section .section_up,footer .footer_section .section_down{margin-bottom:16px!important}footer .footer_section .first_footer_block img[alt="logo footer"]{height:60px!important;margin-bottom:10px!important}';
fs.writeFileSync('style.min.css', mincss);

console.log('Reduced footer height');
