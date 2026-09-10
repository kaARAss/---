const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Clear event-seasons hardcoded content
html = html.replace(/<div class="event-seasons">[\s\S]*?<\/div>\s*<\/section>/, '<div class="event-seasons"></div>\n</section>');

// Replace monthsData
const newMonthsData = [
    {"month":"01","year":"2027","image":"./na-sajt-01-scaled.jpg","event_date":"2027-01-15 19:00:00"},
    {"month":"02","year":"2027","image":"./fotografii-02-scaled.jpg","event_date":"2027-02-14 19:00:00"},
    {"month":"03","year":"2027","image":"./na-sajt-03-scaled.jpg","event_date":"2027-03-08 19:00:00"},
    {"month":"04","year":"2027","image":"./izobrazhenie_2025-12-19_040906162-scaled.png","event_date":"2027-04-12 19:00:00"},
    {"month":"05","year":"2027","image":"./na-sajt-01-scaled.jpg","event_date":"2027-05-01 19:00:00"},
    {"month":"06","year":"2027","image":"./fotografii-02-scaled.jpg","event_date":"2027-06-12 19:00:00"},
    {"month":"07","year":"2027","image":"./na-sajt-03-scaled.jpg","event_date":"2027-07-07 19:00:00"},
    {"month":"08","year":"2027","image":"./izobrazhenie_2025-12-19_040906162-scaled.png","event_date":"2027-08-15 19:00:00"},
    {"month":"09","year":"2027","image":"./na-sajt-01-scaled.jpg","event_date":"2027-09-01 19:00:00"},
    {"month":"10","year":"2027","image":"./fotografii-02-scaled.jpg","event_date":"2027-10-31 19:00:00"}
];

html = html.replace(/window\.monthsData = \[.*?\];/g, `window.monthsData = ${JSON.stringify(newMonthsData)};`);
html = html.replace(/const monthsData = \[.*?\];/g, `const monthsData = ${JSON.stringify(newMonthsData)};`);

fs.writeFileSync('index.html', html);
console.log('Modified index.html');
