const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Also explicitly make sure header has top: 0 and margin: 0
const fixCss = `
<style>
header#main-header {
    top: 0 !important;
    margin-top: 0 !important;
}
</style>
`;

html = html.replace('</head>', fixCss + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Fixed header explicitly');
