const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

if (!css.includes('footer {')) {
    console.log('Could not find footer style');
} else {
    // Add background color to footer to make text readable against the background
    css += `\nfooter { background-color: rgba(0, 0, 0, 0.8) !important; }\n`;
    fs.writeFileSync('style.css', css);
}

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += 'footer{background-color:rgba(0,0,0,0.8)!important}';
fs.writeFileSync('style.min.css', mincss);

console.log('Added background color to footer');
