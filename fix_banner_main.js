const fs = require('fs');
const stylePath = 'style.css';
let css = fs.readFileSync(stylePath, 'utf8');

// Replace the previous .banner_main at the end of the file
css = css.replace(/\.banner_main \{\s*min-height: calc\(100vh - 50px\);\s*display: flex;\s*align-items: center;\s*\}/, 
`.banner_main {
    min-height: calc(100vh - 80px); 
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5% !important;
    margin-top: 80px;
}`);

// Remove the older padding definition to avoid conflicts
css = css.replace(/\.banner_main {\s*padding: 0 5% !important; margin-top: 80px;\s*}/, '');

fs.writeFileSync(stylePath, css);
console.log('Banner main updated in style.css');
