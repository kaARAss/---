const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newContactsSocials = `
            <div style="display: flex; gap: 16px; margin-top: 16px; flex-wrap: wrap;">
                <a target="_blank" href="https://vk.ru/angelikaforis" class="social_btn" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; margin: 0; font-family: Onest, sans-serif; transition: color 0.3s;"><img src="./vk_logo.svg" alt="logo vk" style="width: 24px;"> Написать ВКонтакте</a>
                <a target="_blank" href="https://vk.ru/taisdanceschool" class="social_btn" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; margin: 0; font-family: Onest, sans-serif; transition: color 0.3s;"><img src="./vk_logo.svg" alt="logo vk" style="width: 24px;"> Наша группа VK</a>
                <a target="_blank" href="https://t.me/anzhelika_foris" class="social_btn" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; margin: 0; font-family: Onest, sans-serif; transition: color 0.3s;"><img src="./telegram_logo.svg" alt="logo telegram" style="width: 24px;"> Telegram</a>
                <a target="_blank" href="https://www.instagram.com/anzhelika.foris?igsi=MWZrN2Uwdmt0MGdxcw==" class="social_btn" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; margin: 0; font-family: Onest, sans-serif; transition: color 0.3s;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg> Instagram
                </a>
            </div>
`;

html = html.replace(/<div style="display: flex; gap: 16px; margin-top: 16px; flex-wrap: wrap;">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div class="contacts_map"/, newContactsSocials.trim() + '\n        </div>\n    </div>\n    <div class="contacts_map"');

fs.writeFileSync('index.html', html);
console.log('Contacts socials updated');
