const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove title_first and title_second from desktop
html = html.replace(/<p class="title_first">.*?<\/p>\s*<p class="title_second">.*?<\/p>/s, '');
// Remove title_first and title_second from mobile
html = html.replace(/<p class="title_first">[\s\S]*?<\/p>\s*<p class="title_second">[\s\S]*?<\/p>/s, '');

fs.writeFileSync('index.html', html);
console.log('Text removed from HTML');
