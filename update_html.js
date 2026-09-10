const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the "Изысканная кухня и бар" slide
html = html.replace(
    /<div class="swiper-slide show_block">\s*<div class="image-frame second_order">\s*<img class="cut-corners" src="\.\/izobrazhenie_2025-12-19_021315079-scaled\.webp"[\s\S]*?<\/div>\s*<\/div>/,
    ''
);

// 2. Remove the Entire <section class="bar" id="menu">
html = html.replace(
    /<section class="bar" id="menu">[\s\S]*?<\/section>/,
    ''
);

// 3. Remove header/footer links to "#menu"
html = html.replace(/<li><a href="#menu">Меню<\/a><\/li>/g, '');
html = html.replace(/<a href="#menu">Меню<\/a>/g, '');

// 4. Update "Уникальное шоу и атмосфера"
html = html.replace(
    /<h3>Уникальное шоу и атмосфера<\/h3>\s*<p>В сердце Петербурга для вас оживает мир кабаре.*?<\/p>/,
    `<h3>Уникальное шоу и атмосфера</h3>
                <p>Мы предлагаем эксклюзивное выездное балетное шоу, которое станет главным украшением вашего мероприятия. Наша команда профессиональных артистов приедет на вашу площадку, чтобы создать невероятную атмосферу грации, красоты и праздника, адаптируясь под формат вашего события.</p>`
);

// 5. Update "Пре-шоу"
html = html.replace(
    /<h3>Пре-шоу<\/h3>\s*<p>В лёгких сумерках зала.*?<\/p>/,
    `<h3>Встреча гостей (Пре-шоу)</h3>
                <p>Помимо основной танцевальной программы, мы предлагаем красивую встречу гостей. Наши артисты в роскошных сценических костюмах будут приветствовать приглашенных перед началом мероприятия, создавая атмосферу праздника и идеальные условия для памятных фотографий с первых минут.</p>`
);

// Also remove the "Подробнее" buttons since they point to things that are mostly gone or don't make sense for a single page.
// The user didn't ask to remove them, but maybe I should just point them to #contacts?
// Let's replace the hrefs inside the slider to #contacts.
html = html.replace(/href="#about"/g, 'href="#contacts"');
html = html.replace(/href="#rules"/g, 'href="#contacts"');


fs.writeFileSync('index.html', html);
console.log('HTML updated');
