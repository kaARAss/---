const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<style>\s*\/\* ULTIMATE HEADER TOP FIX FOR ALL DEVICES \*\/[\s\S]*?<\/style>/g, '');

fs.writeFileSync('index.html', html);
console.log('Reverted universal fix');
