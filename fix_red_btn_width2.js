const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');
css = css.replace("header .red_button, .red_button {", "header .buttons .red_button, header .mobile-only .red_button {");
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss = mincss.replace("header .red_button, .red_button{max-width:fit-content!important;padding:10px 24px!important}", "header .buttons .red_button, header .mobile-only .red_button{max-width:fit-content!important;padding:10px 24px!important}");
fs.writeFileSync('style.min.css', mincss);

console.log('Refined red button width override');
