const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');
css += `
/* Override red button width to allow text to fit */
header .red_button, .red_button {
    max-width: fit-content !important;
    padding: 10px 24px !important;
}
`;
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += 'header .red_button, .red_button{max-width:fit-content!important;padding:10px 24px!important}';
fs.writeFileSync('style.min.css', mincss);

console.log('Fixed red button width');
