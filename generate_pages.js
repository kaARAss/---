const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// We need to extract header and footer.
// Let's assume header ends at </header> or intro part, and footer starts at <footer>.
const headerMatch = indexHtml.match(/(.*?<\/header>)/s);
const footerMatch = indexHtml.match(/(<footer[\s\S]*)/s);

if (!headerMatch || !footerMatch) {
    console.error("Could not find header or footer");
    process.exit(1);
}

const headerContent = headerMatch[1];
const footerContent = footerMatch[1];

const baseStyle = `
<style>
    .legal-content {
        max-width: 800px;
        margin: 120px auto 60px auto;
        padding: 0 20px;
        color: #fff;
        line-height: 1.6;
        font-family: Onest, sans-serif;
    }
    .legal-content h1 {
        color: #f8e7bc;
        margin-bottom: 24px;
        font-size: 32px;
    }
    .legal-content h2 {
        color: #f8e7bc;
        margin-top: 32px;
        margin-bottom: 16px;
        font-size: 24px;
    }
    .legal-content p {
        margin-bottom: 16px;
    }
</style>
`;

const privacyPage = `
${headerContent}
${baseStyle}
<div class="legal-content">
    <h1>Политика конфиденциальности</h1>
    <p>Настоящая Политика конфиденциальности описывает, как мы собираем, используем и защищаем вашу личную информацию при использовании нашего сайта.</p>
    <h2>1. Сбор информации</h2>
    <p>Мы собираем информацию, которую вы предоставляете напрямую, например, при заполнении форм обратной связи или покупке билетов (имя, номер телефона, email).</p>
    <h2>2. Использование информации</h2>
    <p>Собранная информация используется для оказания услуг, связи с вами по поводу ваших бронирований и улучшения качества обслуживания.</p>
    <h2>3. Защита данных</h2>
    <p>Мы применяем современные технические и организационные меры для защиты ваших личных данных от несанкционированного доступа.</p>
</div>
${footerContent}
`;

const termsPage = `
${headerContent}
${baseStyle}
<div class="legal-content">
    <h1>Пользовательское соглашение</h1>
    <p>Добро пожаловать на сайт Ta-is DANCE. Используя наш сайт, вы соглашаетесь с условиями данного Пользовательского соглашения.</p>
    <h2>1. Общие положения</h2>
    <p>Сайт предоставляет информацию о балетных шоу на мероприятия и возможность заказать выступления или приобрести билеты.</p>
    <h2>2. Права и обязанности сторон</h2>
    <p>Пользователь обязуется использовать сайт только в законных целях. Мы оставляем за собой право изменять контент и условия в любое время.</p>
    <h2>3. Ответственность</h2>
    <p>Мы стараемся обеспечивать актуальность и точность информации на сайте, но не несем ответственности за возможные технические сбои.</p>
</div>
${footerContent}
`;

const offerPage = `
${headerContent}
${baseStyle}
<div class="legal-content">
    <h1>Договор оферты</h1>
    <p>Настоящий Договор является официальным предложением (публичной офертой) заключить договор на оказание услуг по организации балетного шоу на мероприятиях.</p>
    <h2>1. Предмет договора</h2>
    <p>Исполнитель обязуется оказать услуги по организации выступления балетного шоу на мероприятии Заказчика, а Заказчик обязуется оплатить эти услуги.</p>
    <h2>2. Условия оказания услуг</h2>
    <p>Конкретные детали выступления (дата, время, место, длительность, программа) согласовываются сторонами индивидуально при бронировании.</p>
    <h2>3. Оплата</h2>
    <p>Услуги оплачиваются в соответствии с тарифами, утвержденными Исполнителем. Бронирование даты считается подтвержденным после внесения предоплаты.</p>
</div>
${footerContent}
`;

fs.writeFileSync('privacy.html', privacyPage);
fs.writeFileSync('terms.html', termsPage);
fs.writeFileSync('offer.html', offerPage);
console.log('Pages created successfully');
