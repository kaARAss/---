const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldStr = `<div class="image-frame">
                <img class="cut-corners" src="./izobrazhenie_2025-12-19_021213070-scaled.webp"`;
const newStr = `<div class="image-frame second_order">
                <img class="cut-corners" src="./izobrazhenie_2025-12-19_021213070-scaled.webp"`;

html = html.replace(oldStr, newStr);
fs.writeFileSync('index.html', html);
console.log('Replaced successfully');
