const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    /<div class="link_block">[\s\S]*?<\/div>/,
    `<div class="link_block" style="flex-wrap: wrap; justify-content: center;">
                    <a target="_blank" href="https://vk.ru/angelikaforis" class="social_btn" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none;"><img src="./vk_logo.svg" alt="logo vk"> ЛС</a>
                    <a target="_blank" href="https://vk.ru/taisdanceschool" class="social_btn" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none;"><img src="./vk_logo.svg" alt="logo vk"> Группа</a>
                    <a target="_blank" href="https://t.me/anzhelika_foris" class="social_btn" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none;"><img src="./telegram_logo.svg" alt="logo telegram"></a>
                    <a target="_blank" href="https://www.instagram.com/anzhelika.foris?igsi=MWZrN2Uwdmt0MGdxcw==" class="social_btn" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; font-weight: bold;">Inst</a>
                </div>`
);

fs.writeFileSync('index.html', html);
