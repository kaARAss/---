const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');
console.log(seats.substring(seats.indexOf('function renderMedia'), seats.indexOf('function renderMedia') + 1000));
