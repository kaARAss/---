const fs = require('fs');
let js = fs.readFileSync('seats.js', 'utf8');

js = js.replace(/document\.body\.classList\.add\('no-scroll'\);/g, "document.body.classList.add('no-scroll');\n    document.body.classList.add('hide-content-mode');");

fs.writeFileSync('seats.js', js);
console.log('Fixed openEventTickets');
