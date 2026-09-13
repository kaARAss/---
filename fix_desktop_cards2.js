const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const fixCss = `
<style>
/* Refined text sizes to ensure perfect fit inside the 228x311 red frame */
.events .event-seasons .event-item .content h2 {
    font-size: 24px !important; 
    line-height: 1.1 !important;
    margin-top: 15px !important;
    margin-bottom: 15px !important;
}

.events .event-seasons .event-item .content .card-subtitle {
    font-size: 13px !important;
    line-height: 1.25 !important;
    padding-left: 5px !important;
    padding-right: 5px !important;
}
</style>
`;

html = html.replace('</head>', fixCss + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Fixed card text styles more finely');
