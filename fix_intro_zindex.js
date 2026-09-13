const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const introFix = `
<style>
#intro {
    z-index: 99999 !important;
}
</style>
`;

html = html.replace('</head>', introFix + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Fixed intro z-index');
