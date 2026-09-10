const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<img src="\.\/18\+\.png" alt="18\+" style="margin-bottom: 24px; width: 50px;">/, '');

fs.writeFileSync('index.html', html);
console.log('Contacts 18+ updated');
