const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldStr = `const moveX = (centerX - wrapperCenterX) - 12; // Смещаем на 3мм влево`;
const newStr = `const moveX = (centerX - wrapperCenterX) - 20; // Смещаем на 5мм влево (изначально 3мм + еще 2мм)`;

html = html.replace(oldStr, newStr);
fs.writeFileSync('index.html', html);
console.log('Replaced moveX successfully');
