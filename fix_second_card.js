const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/window\.monthsData\s*=\s*(\[.*?\]);/);
if (match) {
    const data = JSON.parse(match[1]);
    
    // Check if we have at least 2 items
    if (data.length > 1) {
        data[1].image = "./show2.png";
        data[1].is_custom_image = true;
        
        const newDataStr = JSON.stringify(data);
        html = html.replace(match[0], `window.monthsData = ${newDataStr};`);
        fs.writeFileSync('index.html', html);
        console.log('index.html updated with show2.png');
    }
}
