const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// replace padding again just in case
css = css.replace('padding: 20px 5% 10px 5% !important;', 'padding: 10px 5% 5px 5% !important;');

// Replace margin-top of footer
css = css.replace('margin-top: 50px;\n    position: relative;', 'margin-top: 20px;\n    position: relative;');

if (!css.includes('.footer_hr {')) {
    css += `\n.footer_hr { margin: 8px 0 !important; }\n`;
}

// override section_up/down
css += `
footer .footer_section .section_up {
    margin-bottom: 8px !important;
}
footer .footer_section .section_down {
    margin-top: 8px !important;
    margin-bottom: 8px !important;
}
`;

fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss = mincss.replace('padding:20px 5% 10px 5%!important', 'padding:10px 5% 5px 5%!important');
mincss += '.footer_hr{margin:8px 0!important}footer .footer_section .section_up{margin-bottom:8px!important}footer .footer_section .section_down{margin-top:8px!important;margin-bottom:8px!important}';
fs.writeFileSync('style.min.css', mincss);
console.log('Fixed more footer height');
