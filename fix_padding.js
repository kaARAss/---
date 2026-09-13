const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

if (seats.includes("thumbsCol.style.paddingRight = '5px';")) {
    seats = seats.replace("thumbsCol.style.paddingRight = '5px';", "thumbsCol.style.paddingRight = '0px';");
    fs.writeFileSync('seats.js', seats);
    console.log('Padding fixed');
}
