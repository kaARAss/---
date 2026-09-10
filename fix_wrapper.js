const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the wrapper inline styles to just display: flex and align-items: center
// This lets it take its natural width from the 72px height image.
html = html.replace(
    /id="logo-wrapper" style="[^"]*"/,
    'id="logo-wrapper" style="display: flex; align-items: center; justify-content: center; height: 72px; margin-top: 5px;"'
);

fs.writeFileSync('index.html', html);
console.log('Wrapper fixed');
