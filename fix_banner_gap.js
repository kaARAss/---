const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const fixCss = `
<style>
/* Remove the massive top gap above the banner so it sits under the transparent header */
.banner_main {
    padding-top: 0 !important;
}
</style>
`;

html = html.replace('</head>', fixCss + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Fixed banner gap');
