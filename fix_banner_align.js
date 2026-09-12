const fs = require('fs');
const stylePath = 'style.css';
let css = fs.readFileSync(stylePath, 'utf8');

// Replace the previous .banner_main at the end of the file
css = css.replace(/\.banner_main \{\s*min-height: 100vh !important;\s*\}/, 
`.banner_main {
    min-height: 100vh !important;
    padding-top: 80px !important;
    align-items: flex-start !important;
}`);

fs.writeFileSync(stylePath, css);
console.log('Banner main updated for top alignment');
