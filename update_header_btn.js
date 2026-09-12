const fs = require('fs');
const files = ['index.html', 'offer.html', 'privacy.html', 'terms.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');
        html = html.replace(/<a class="red_button burger_button" href="#events">Билеты<\/a>/g, '<a class="red_button burger_button" href="#events">Шоу</a>');
        html = html.replace(/<a class="red_button" href="#events">Билеты<\/a>/g, '<a class="red_button" href="#events">Шоу</a>');
        // Also check if there's any other exact match just in case
        html = html.replace(/>Билеты<\/a>/g, '>Шоу</a>');
        fs.writeFileSync(file, html);
    }
});
console.log('Replaced header buttons text');
