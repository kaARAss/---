const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

if (!css.includes('.thumbs-col::-webkit-scrollbar')) {
    css += `

/* Hide scrollbar for thumbs column */
.thumbs-col::-webkit-scrollbar {
    display: none !important;
}
.thumbs-col {
    -ms-overflow-style: none !important;  /* IE and Edge */
    scrollbar-width: none !important;  /* Firefox */
}
`;
    fs.writeFileSync('style.css', css);
    console.log('Scrollbar hidden in style.css');
}

let seats = fs.readFileSync('seats.js', 'utf8');

// Optionally, we can also inject the class name 'thumbs-col' just to be sure if it wasn't there
if (!seats.includes("thumbsCol.className = 'thumbs-col'")) {
    seats = seats.replace("const thumbsCol = document.createElement('div');", "const thumbsCol = document.createElement('div');\n    thumbsCol.className = 'thumbs-col';");
    fs.writeFileSync('seats.js', seats);
}

