const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const tapFix = `
<style>
.banner_image {
    -webkit-tap-highlight-color: transparent !important;
    outline: none !important;
}
</style>
`;
html = html.replace('</head>', tapFix + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Added tap highlight fix');
