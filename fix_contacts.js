const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldStr = `display: flex; gap: 16px; margin-top: 16px; flex-wrap: wrap;`;
const newStr = `display: flex; flex-direction: column; gap: 16px; margin-top: 16px;`;

html = html.replace(oldStr, newStr);
fs.writeFileSync('index.html', html);
console.log('Replaced flex layout for contacts.');
