const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const hoverFixCss = `
/* Disable hover animation on mobile banner */
@media only screen and (max-width: 1024px) {
    .banner_image:hover,
    .banner_image:active,
    .banner_image:focus {
        background-image: image-set(url(img/index/Banner_mobile.webp) type("image/webp"), url(img/index/Banner_mobile.png) type("image/png")) !important;
        /* Fallback for browsers not supporting image-set */
        background-image: url(img/index/Banner_mobile.png) !important;
    }
}
`;

html = html.replace('/* Desktop fixes for thumbs wrapper */', hoverFixCss + '\n/* Desktop fixes for thumbs wrapper */');

fs.writeFileSync('index.html', html);
console.log('Fixed hover on mobile');
