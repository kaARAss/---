const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/window\.monthsData\s*=\s*(\[.*?\]);/);
if (match) {
    const data = JSON.parse(match[1]);
    
    // Check if we have at least 1 item
    if (data.length > 0) {
        data[0].media = [
            { type: 'video', label: 'Видео', url: '' },
            { type: 'image', label: 'Фото 1', url: './show1.png' }, // example photo 1
            { type: 'image', label: 'Фото 2', url: '' },
            { type: 'image', label: 'Фото 3', url: '' },
            { type: 'image', label: 'Фото 4', url: '' }
        ];
        
        const newDataStr = JSON.stringify(data);
        html = html.replace(match[0], `window.monthsData = ${newDataStr};`);
        fs.writeFileSync('index.html', html);
        console.log('index.html updated with media property');
    }
}
