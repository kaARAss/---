const fs = require('fs');
let js = fs.readFileSync('seats.js', 'utf8');

// Remove the backdrop logic we added previously
js = js.replace(/document\.querySelector\('\.modal-backdrop'\)\.style\.display = 'block';/g, "");
js = js.replace(/document\.querySelector\('\.modal-backdrop'\)\.style\.display = 'none';/g, "");
js = js.replace(/const style = document\.createElement\('style'\);\nstyle\.textContent = `[\s\S]*?}\n`;\ndocument\.head\.appendChild\(style\);\n\nconst backdrop = document\.createElement\('div'\);\nbackdrop\.className = 'modal-backdrop';\ndocument\.body\.appendChild\(backdrop\);\n\nbackdrop\.addEventListener\('click', \(\) => {[\s\S]*?}\);\n/m, "");

// Add a specific escape key handler if the backdrop one was removed
// Let's replace the previous escape key handler
js = js.replace(/\/\/ Fix ESC key[\s\S]*?}\);/m, "");

fs.writeFileSync('seats.js', js);
console.log('Cleaned up previous backdrop');
