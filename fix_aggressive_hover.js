const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const aggressiveFix = `
<style>
/* ABSOLUTE OVERRIDE FOR MOBILE BANNER ANIMATION */
@media only screen and (max-width: 1024px) {
    .banner_image, 
    .banner_image:hover, 
    .banner_image:active, 
    .banner_image:focus,
    .banner .banner_image,
    .banner .banner_image:hover,
    .banner .banner_image:active {
        background-image: image-set(url(img/index/Banner_mobile.webp) type("image/webp"), url(img/index/Banner_mobile.png) type("image/png")) !important;
        transform: scaleX(1) !important;
        transition: none !important;
        animation: none !important;
        opacity: 1 !important;
        filter: none !important;
    }
}
</style>
`;

html = html.replace('</head>', aggressiveFix + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Aggressive fix applied');
