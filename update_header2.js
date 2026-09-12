const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
`                    const scale = window.innerWidth < 768 ? 1.6 : 2.0;
                    // Опускаем еще на 2мм (+8 пикселей)
                    const moveY = window.innerWidth < 768 ? 24 : 28;`,
`                    const scale = window.innerWidth < 768 ? 1.9 : 2.4;
                    // Опускаем еще на 3мм (+12 пикселей)
                    const moveY = window.innerWidth < 768 ? 36 : 40;`
);

fs.writeFileSync('index.html', html);
console.log('index.html updated successfully.');
