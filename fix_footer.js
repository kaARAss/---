const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove 18+ icon
html = html.replace(/<div class="plus_image">[\s\S]*?<\/div>/, '');

// 2. Fix the logo (replace style to fix squishing)
html = html.replace(
    /<img src="\.\/logo\.png" alt="logo footer" style="height: 72px; width: auto; mix-blend-mode: screen;">/,
    '<img src="./logo.png" alt="logo footer" style="height: 100px; width: auto; max-width: 100%; object-fit: contain; mix-blend-mode: screen;">'
);

// 3. Replace the social links
const newSocialLinks = `
<div class="link_block" style="display: flex; flex-direction: column; gap: 12px;">
    <a target="_blank" href="https://vk.ru/angelikaforis" class="social_btn" style="display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.8); text-decoration: none; font-family: Onest, sans-serif; font-size: 16px; transition: color 0.3s;">
        <img src="./vk_logo.svg" alt="logo vk" style="width: 24px;"> Написать ВКонтакте
    </a>
    <a target="_blank" href="https://vk.ru/taisdanceschool" class="social_btn" style="display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.8); text-decoration: none; font-family: Onest, sans-serif; font-size: 16px; transition: color 0.3s;">
        <img src="./vk_logo.svg" alt="logo vk" style="width: 24px;"> Наша группа VK
    </a>
    <a target="_blank" href="https://t.me/anzhelika_foris" class="social_btn" style="display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.8); text-decoration: none; font-family: Onest, sans-serif; font-size: 16px; transition: color 0.3s;">
        <img src="./telegram_logo.svg" alt="logo telegram" style="width: 24px;"> Telegram
    </a>
    <a target="_blank" href="https://www.instagram.com/anzhelika.foris?igsi=MWZrN2Uwdmt0MGdxcw==" class="social_btn" style="display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.8); text-decoration: none; font-family: Onest, sans-serif; font-size: 16px; transition: color 0.3s;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg> 
        Instagram
    </a>
</div>`;

html = html.replace(/<div class="link_block" style="flex-wrap: wrap; justify-content: center;">[\s\S]*?<\/div>/, newSocialLinks);

fs.writeFileSync('index.html', html);
console.log('index.html footer updated');
