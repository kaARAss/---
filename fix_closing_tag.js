const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('</style><link rel="stylesheet"', '<link rel="stylesheet"');

fs.writeFileSync('index.html', html);
console.log('Fixed');
