const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

css = css.replace(/justify-content: flex-start !important;/g, "justify-content: flex-start !important; z-index: 10 !important; opacity: 1 !important; visibility: visible !important; min-height: 200px !important; display: flex !important; flex: 1 !important;");

fs.writeFileSync('style.css', css);

let min = fs.readFileSync('style.min.css', 'utf8');
min = min.replace(/justify-content: flex-start !important;/g, "justify-content: flex-start !important; z-index: 10 !important; opacity: 1 !important; visibility: visible !important; min-height: 200px !important; display: flex !important; flex: 1 !important;");
fs.writeFileSync('style.min.css', min);

console.log("Visibility fixed");
