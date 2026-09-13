const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const fixCss = `
<style>
/* Fix title and subtitle sizes on desktop so they fit inside the red frame */
.events .event-seasons .event-item .content {
    /* Keep it positioned properly inside the red frame */
    padding: 20px !important;
    box-sizing: border-box !important;
    justify-content: flex-start !important;
    padding-top: 30px !important;
}

.events .event-seasons .event-item .content h2 {
    font-size: 26px !important; /* Smaller, so "Ночные птицы (световой номер)" fits */
    margin: 0 0 10px 0 !important;
    line-height: 1.1 !important;
    text-align: center !important;
}

.events .event-seasons .event-item .content .card-subtitle {
    font-size: 14px !important;
    line-height: 1.3 !important;
    margin: 0 0 15px 0 !important;
    color: #fff !important;
    font-family: Onest, sans-serif !important;
    /* Limit lines if needed, but flex should handle it */
}

.events .event-seasons .event-item .content .card-divider {
    width: 60% !important;
    margin: 10px auto !important;
    border: none !important;
    border-top: 1px solid rgba(255, 255, 255, 0.4) !important;
}

.events .event-seasons .event-item .content .event-item_button {
    margin-top: auto !important; /* Push button to bottom if there's space */
    padding: 8px 16px !important;
    font-size: 14px !important;
}
</style>
`;

html = html.replace('</head>', fixCss + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Fixed card text styles');
