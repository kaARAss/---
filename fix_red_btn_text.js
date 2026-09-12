const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');
css += `
.red_button {
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
`;
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += '.red_button{text-align:center;display:inline-flex;align-items:center;justify-content:center}';
fs.writeFileSync('style.min.css', mincss);

console.log('Fixed red button text alignment');
