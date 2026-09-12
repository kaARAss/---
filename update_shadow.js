const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldFilter = 'filter: drop-shadow(0px 0px 15px rgba(0,0,0,0.8)) drop-shadow(0px 0px 30px rgba(0,0,0,0.6));';
const newFilter = 'filter: drop-shadow(0px 0px 3px rgba(0,0,0,1)) drop-shadow(0px 0px 12px rgba(0,0,0,1)) drop-shadow(0px 0px 25px rgba(0,0,0,0.9)) drop-shadow(0px 0px 50px rgba(0,0,0,0.7));';

html = html.replace(oldFilter, newFilter);

fs.writeFileSync('index.html', html);
console.log('Shadow updated');
