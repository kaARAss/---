const fs = require('fs');
let min = fs.readFileSync('style.min.css', 'utf8');

const regex1 = /\.events \.event-seasons \.event-item \.content\s*\{\s*width:\s*42%\s*!important.*?\}\s*/g;
min = min.replace(regex1, '');

const regex2 = /\.events \.event-seasons \.event-item \.overlay-image\s*\{\s*width:\s*42%\s*!important.*?\}\s*/g;
min = min.replace(regex2, '');

const regex3 = /@media only screen and \(max-width:\s*760px\)\s*\{\s*\.events \.event-item \.content h2.*?\}\s*\}/g;
min = min.replace(regex3, '');

fs.writeFileSync('style.min.css', min);
