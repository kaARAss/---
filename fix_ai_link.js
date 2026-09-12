const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('<a href="/sitemap.xml" class="ai_link">Карта сайта</a>', '<a href="/sitemap.xml">Карта сайта</a>');

fs.writeFileSync('index.html', html);
console.log('Removed ai_link class');
