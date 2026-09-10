const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    /<img id="animated-logo".*?>/,
    '<img id="animated-logo" src="./logo.png" alt="logo" style="height: 72px; width: auto; mix-blend-mode: screen; transform-origin: center center; transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1); position: relative; z-index: 1000;">'
);

fs.writeFileSync('index.html', html);
console.log('Z-index added');
