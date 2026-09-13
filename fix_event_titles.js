const fs = require('fs');

// 1. Update seats.js
let seatsJs = fs.readFileSync('seats.js', 'utf8');

seatsJs = seatsJs.replace(
    "const title = document.createElement('h2');\n        title.textContent = 'НАЗВАНИЕ ШОУ';",
    "const title = document.createElement('h2');\n        title.textContent = monthData.title || 'НАЗВАНИЕ ШОУ';"
);

seatsJs = seatsJs.replace(
    "const subtitle = document.createElement('p');\n        subtitle.className = 'card-subtitle';\n        subtitle.textContent = 'ОПИСАНИЕ ШОУ';",
    "const subtitle = document.createElement('p');\n        subtitle.className = 'card-subtitle';\n        subtitle.textContent = monthData.description || 'ОПИСАНИЕ ШОУ';"
);

fs.writeFileSync('seats.js', seatsJs);
console.log('seats.js updated.');

// 2. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/window\.monthsData\s*=\s*(\[.*?\]);/);
if (match) {
    const data = JSON.parse(match[1]);
    if (data.length > 0) {
        data[0].title = "Ночные птицы (световой номер)";
        data[0].description = "Уникальное сочетание бурлеска и световых эффектов, погружающее в гипнотическую атмосферу ночи.";
        
        const newDataStr = JSON.stringify(data);
        html = html.replace(match[0], `window.monthsData = ${newDataStr};`);
        fs.writeFileSync('index.html', html);
        console.log('index.html updated.');
    }
} else {
    console.log('Could not find window.monthsData in index.html');
}
