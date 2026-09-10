const fs = require('fs');
const stylePath = 'style.css';
let css = fs.readFileSync(stylePath, 'utf8');

css = css.replace(/\.banner_main \{[\s\S]*?margin-top: 80px;\s*\}/, '');

fs.writeFileSync(stylePath, css);
console.log('Removed broken .banner_main from style.css');
