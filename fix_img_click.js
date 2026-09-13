const fs = require('fs');

let seats = fs.readFileSync('seats.js', 'utf8');

// The block to remove starts from "// Клик для открытия на полный экран" down to "mainDisplay.appendChild(img);"
// Let's just use regex or split to replace it.

const startMarker = "// Клик для открытия на полный экран";
const endMarker = "mainDisplay.appendChild(img);";

let startIndex = seats.indexOf(startMarker);
if (startIndex !== -1) {
    let endIndex = seats.indexOf(endMarker, startIndex);
    if (endIndex !== -1) {
        let textToRemove = seats.substring(startIndex, endIndex);
        seats = seats.replace(textToRemove, "");
        // also remove pointer
        seats = seats.replace("img.style.cursor = 'pointer';", "");
        fs.writeFileSync('seats.js', seats);
        console.log('Fullscreen click removed');
    }
}
