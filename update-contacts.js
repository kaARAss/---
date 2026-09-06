const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    /<h3>Санкт-Петербург, Миллионная улица дом 6<\/h3>\s*<p>Как нас найти: БЦ Сенатор - зайдите в арку, сразу после арки поверните налево, сделайте пару шагов вдоль стены и ещё раз поверните налево\. Вам нужна стеклянная дверь с летучей мышью\.<\/p>/g,
    `<h3>Самара, улица Водников, 49</h3>
        <p>Как нас найти: Школа танцев Та-Ис - вход со стороны улицы Водников.</p>`
);

html = html.replace(
    /<iframe src="\.\/saved_resource\(11\)\.html" allowfullscreen="true"><\/iframe>/g,
    `<iframe src="https://yandex.ru/map-widget/v1/?ll=50.079045%2C53.183485&z=16" width="100%" height="400" frameborder="0" allowfullscreen="true" style="position:relative;"></iframe>`
);

fs.writeFileSync('index.html', html);
