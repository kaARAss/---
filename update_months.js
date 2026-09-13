const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /window\.monthsData\s*=\s*(\[.*?\]);/s;
const match = html.match(regex);

if (match) {
    let monthsData = JSON.parse(match[1]);
    
    // Update show 2
    monthsData[1].title = "Шоу 2";
    monthsData[1].description = "Ослепительное и яркое шоу";
    monthsData[1].detailsText = "\n        <h3 style=\"color: #f8e7bc; margin-top: 0; font-size: 22px; font-weight: 500;\">О шоу</h3>\n        <p style=\"margin-bottom: 15px;\">✨ Описание скоро появится.</p>\n    ";
    monthsData[1].media = [
      { "type": "video", "label": "Видео", "url": "./img/block/show2_video1.mp4" },
      { "type": "image", "label": "Фото 1", "url": "./img/block/show2_photo1.png" },
      { "type": "image", "label": "Фото 2", "url": "./img/block/show2_photo2.png" },
      { "type": "image", "label": "Фото 3", "url": "./img/block/show2_photo3.png" }
    ];

    // Update show 3
    monthsData[2].title = "Шоу 3";
    monthsData[2].description = "Невероятное представление с уникальной хореографией";
    monthsData[2].detailsText = "\n        <h3 style=\"color: #f8e7bc; margin-top: 0; font-size: 22px; font-weight: 500;\">О шоу</h3>\n        <p style=\"margin-bottom: 15px;\">✨ Описание скоро появится.</p>\n    ";
    monthsData[2].media = [
      { "type": "image", "label": "Фото 1", "url": "./img/block/show3_photo1.png" },
      { "type": "image", "label": "Фото 2", "url": "./img/block/show3_photo2.png" },
      { "type": "image", "label": "Фото 3", "url": "./img/block/show3_photo3.png" }
    ];
    
    // Update show 4
    monthsData[3].title = "Шоу 4";
    monthsData[3].description = "Магия и танец в одном номере";
    monthsData[3].detailsText = "\n        <h3 style=\"color: #f8e7bc; margin-top: 0; font-size: 22px; font-weight: 500;\">О шоу</h3>\n        <p style=\"margin-bottom: 15px;\">✨ Описание скоро появится.</p>\n    ";
    monthsData[3].media = [
      { "type": "video", "label": "Видео 1", "url": "./img/block/show4_video1.mp4" },
      { "type": "video", "label": "Видео 2", "url": "./img/block/show4_video2.mp4" },
      { "type": "video", "label": "Видео 3", "url": "./img/block/show4_video3.mp4" },
      { "type": "video", "label": "Видео 4", "url": "./img/block/show4_video4.mp4" },
      { "type": "video", "label": "Видео 5", "url": "./img/block/show4_video5.mp4" },
      { "type": "image", "label": "Фото 1", "url": "./img/block/show4_photo1.png" }
    ];

    const newDataStr = JSON.stringify(monthsData);
    html = html.replace(regex, `window.monthsData = ${newDataStr};`);
    fs.writeFileSync('index.html', html);
    console.log("Updated months data!");
} else {
    console.log("Could not find window.monthsData array.");
}
