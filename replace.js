const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace Phone
html = html.replace(/tel:\+70000000000/g, "tel:+79608312166");
html = html.replace(/\+7 \(XXX\) XXX-XX-XX/g, "+7 (960) 831-21-66");

// Replace Socials in Contacts
html = html.replace(/<a target="_blank" href="#" class="social_btn"([^>]*)><img src="\.\/vk_logo.svg" alt="logo vk"([^>]*)> ЛС<\/a>/g, '<a target="_blank" href="https://vk.ru/angelikaforis" class="social_btn"$1><img src="./vk_logo.svg" alt="logo vk"$2> ЛС</a>');
html = html.replace(/<a target="_blank" href="#" class="social_btn"([^>]*)><img src="\.\/vk_logo.svg" alt="logo vk"([^>]*)> Группа<\/a>/g, '<a target="_blank" href="https://vk.ru/taisdanceschool" class="social_btn"$1><img src="./vk_logo.svg" alt="logo vk"$2> Группа</a>');
html = html.replace(/<a target="_blank" href="#" class="social_btn"([^>]*)><img src="\.\/telegram_logo.svg" alt="logo telegram"([^>]*)> Telegram<\/a>/g, '<a target="_blank" href="https://t.me/anzhelika_foris" class="social_btn"$1><img src="./telegram_logo.svg" alt="logo telegram"$2> Telegram</a>');

// Replace Socials in Footer (no text for TG)
html = html.replace(/<a target="_blank" href="#" class="social_btn"([^>]*)><img src="\.\/telegram_logo.svg" alt="logo telegram"><\/a>/g, '<a target="_blank" href="https://t.me/anzhelika_foris" class="social_btn"$1><img src="./telegram_logo.svg" alt="logo telegram"></a>');

// Remove ИП Бакуменко / ИНН
html = html.replace(/<p>ИП Бакуменко Вячеслав Викторович <br> ИНН: 781143261404<\/p>/g, "");

// Change MyCompany to Ta-is DANCE
html = html.replace(/MyCompany/g, "Ta-is DANCE");

// Update Hero Title
html = html.replace(/ВЫЕЗДНОЕ ШОУ НА ЗАКАЗ/g, "БАЛЕТНОЕ ШОУ НА МЕРОПРИЯТИЯ");
html = html.replace(/Выездное шоу на заказ/g, "Балетное шоу на мероприятия");

// Update links for privacy and terms and offer
html = html.replace(/href="#policy"/g, 'href="/privacy.html"');
html = html.replace(/href="#offer"/g, 'href="/offer.html"');

fs.writeFileSync('index.html', html);
console.log('done');
