const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const fixCss = `
<style>
/* Refined text sizes and fonts for desktop event cards */
.events .event-seasons .event-item .content h2 {
    font-size: 20px !important; /* Smaller size to fit well */
    line-height: 1.2 !important;
    margin-top: 20px !important;
    margin-bottom: 15px !important;
    font-family: Onest, sans-serif !important; /* Changed to cleaner font */
    font-weight: 500 !important;
    letter-spacing: 0.5px !important;
    text-transform: uppercase !important;
}

.events .event-seasons .event-item .content .card-subtitle {
    font-size: 13px !important;
    line-height: 1.3 !important;
    padding-left: 10px !important;
    padding-right: 10px !important;
    font-family: Onest, sans-serif !important;
    font-weight: 300 !important;
    color: #fff !important;
}

.events .event-seasons .event-item .content {
    justify-content: flex-start !important;
    padding-top: 25px !important;
}
</style>
`;

html = html.replace('</head>', fixCss + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Fixed card text styles (font and size)');
