const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

seats = seats.replace(
/const title = document\.createElement\('h2'\);\s*title\.textContent = monthText;/g,
`const title = document.createElement('h2');
        title.textContent = 'НАЗВАНИЕ ШОУ'; 
        const divider = document.createElement('hr');
        divider.className = 'card-divider';
        const subtitle = document.createElement('p');
        subtitle.className = 'card-subtitle';
        subtitle.textContent = monthText; // Keeping month as subtitle so it matches original data loosely`
);

seats = seats.replace(
/content\.appendChild\(title\);\s*content\.appendChild\(button\);/g,
`content.appendChild(title);
        content.appendChild(divider);
        content.appendChild(subtitle);
        content.appendChild(button);`
);

fs.writeFileSync('seats.js', seats);
console.log('Modified seats.js 2');
