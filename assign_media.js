const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/window\.monthsData\s*=\s*(\[.*?\]);/);
if (match) {
    const data = JSON.parse(match[1]);
    
    if (data.length > 0) {
        data[0].media = [
            { type: 'video', label: 'Видео', url: './img/block/show1_video.MP4' },
            { type: 'image', label: 'Фото 1', url: './img/block/show1_photo1.PNG' },
            { type: 'image', label: 'Фото 2', url: './img/block/show1_photo2.PNG' },
            { type: 'image', label: 'Фото 3', url: './img/block/show1_photo3.PNG' }
        ];
        
        const newDataStr = JSON.stringify(data);
        html = html.replace(match[0], `window.monthsData = ${newDataStr};`);
        fs.writeFileSync('index.html', html);
        console.log('index.html updated with accurate media for show1');
    }
}
