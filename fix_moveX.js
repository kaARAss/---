const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldStr = `const moveX = centerX - wrapperCenterX;`;
const newStr = `const moveX = (centerX - wrapperCenterX) - 12; // Смещаем на 3мм влево`;

html = html.replace(oldStr, newStr);
fs.writeFileSync('index.html', html);
console.log('Replaced moveX successfully');
