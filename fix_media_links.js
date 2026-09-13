const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /window\.monthsData\s*=\s*(\[.*?\]);/s;
const match = html.match(regex);

if (match) {
    let monthsData = JSON.parse(match[1]);
    
    // We will just show generic mock content for missing files, or I can fix the path if they uploaded it directly to the root.
    // Replace URL paths from img/block/ to just / or ./ if they were uploaded directly to root
    for (let i = 1; i < 4; i++) {
       if (monthsData[i].media) {
           monthsData[i].media.forEach(m => {
               // Remove img/block/ from path if they are in root
               m.url = m.url.replace('./img/block/', './');
           });
       }
    }
    
    const newDataStr = JSON.stringify(monthsData);
    html = html.replace(regex, `window.monthsData = ${newDataStr};`);
    fs.writeFileSync('index.html', html);
    console.log("Updated URLs in months data!");
} else {
    console.log("Could not find window.monthsData array.");
}
