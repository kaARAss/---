const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The original block looks like:
// <div class="banner_image" style="position: relative;">
//     <span id="star-anchor" ...></span>
//     <div class="banner_content desktop_only">
//         <a class="red_button" href="#contacts">Подробнее о шоу</a>
//     </div>
// </div>
// <div class="banner_content mobile_only">
//     <a class="red_button" href="#contacts">Подробнее о шоу</a>
// </div>

html = html.replace(/<div class="banner_image"(.*?)>([\s\S]*?)<div class="banner_content desktop_only">\s*<a class="red_button"[^>]*>Подробнее о шоу<\/a>\s*<\/div>\s*<\/div>\s*<div class="banner_content mobile_only">\s*<a class="red_button"[^>]*>Подробнее о шоу<\/a>\s*<\/div>/,
`<a href="#events" class="banner_image"$1 style="display: block; width: 100%; position: relative; cursor: pointer; text-decoration: none;">$2</a>`);

fs.writeFileSync('index.html', html);
console.log('Fixed banner buttons');
