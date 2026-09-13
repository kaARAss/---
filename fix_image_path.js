const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const match = html.match(/window\.monthsData\s*=\s*(\[.*?\]);/);
if (match) {
    const data = JSON.parse(match[1]);
    if (data.length > 0) {
        // Fallback to original image if show1.png is missing from the file system
        data[0].image = "./na-sajt-01-scaled.jpg"; 
        
        const newDataStr = JSON.stringify(data);
        html = html.replace(match[0], `window.monthsData = ${newDataStr};`);
        fs.writeFileSync('index.html', html);
        console.log('Reverted to default image because show1.png was not found');
    }
}
