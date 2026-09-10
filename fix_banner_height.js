const fs = require('fs');
const stylePath = 'style.css';
let css = fs.readFileSync(stylePath, 'utf8');

// Find the .banner_main padding and increase it slightly to push the content down
css = css.replace(/\.banner_main {\s*padding: 115px 5% !important;\s*}/, '.banner_main {\n    padding: 140px 5% !important;\n}');

fs.writeFileSync(stylePath, css);
console.log('Banner padding updated in style.css');
