const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const match = html.match(/window\.monthsData\s*=\s*(\[.*?\]);/);
if (match) {
    const data = JSON.parse(match[1]);
    if (data.length > 0) {
        data[0].image = "./show1.png";
        data[0].is_custom_image = true;
        
        const newDataStr = JSON.stringify(data);
        html = html.replace(match[0], `window.monthsData = ${newDataStr};`);
        fs.writeFileSync('index.html', html);
        console.log('index.html updated with show1.png');
    }
}
