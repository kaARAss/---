const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /window\.monthsData\s*=\s*(\[.*?\]);/s;
const match = html.match(regex);

if (match) {
    let monthsData = JSON.parse(match[1]);
    
    // We will just show generic mock content for missing files, or I can fix the path if they uploaded it directly to the root.
    // Wait, the user said "я добавил фотки и видео для других карточек" - let me check if they uploaded them directly to the root directory
    
}
