const fs = require('fs');
const files = ['index.html', 'offer.html', 'privacy.html', 'terms.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');
        // Replace in the header button specifically
        html = html.replace(/<a class="red_button burger_button" href="#events">Шоу<\/a>/g, '<a class="red_button burger_button" href="#events">Заказать шоу</a>');
        html = html.replace(/<a class="red_button" href="#events">Шоу<\/a>/g, '<a class="red_button" href="#events">Заказать шоу</a>');
        fs.writeFileSync(file, html);
    }
});
console.log('Replaced header buttons text to Заказать шоу');
