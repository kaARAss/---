const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// I will clean up the footer block links that are obsolete like "Правила посещения" if they look confusing.
html = html.replace(/<a href="#contacts">Правила посещения<\/a>/, '');
html = html.replace(/<a href="#spravka\/">Справка<\/a>/, '');
html = html.replace(/<a href="##" class="order_event">Заказать мероприятие<\/a>/, '<a href="#contacts" class="order_event">Заказать мероприятие</a>');

fs.writeFileSync('index.html', html);
console.log('Footer cleaned');
