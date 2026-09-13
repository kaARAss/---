const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const hoverRule = `
@media only screen and (min-width: 1025px) {
    .banner .banner_image:hover {
        background-image: url(img/index/Banner_hover.png) !important;
    }
}
`;

if (!css.includes('Banner_hover.png')) {
    css += hoverRule;
    fs.writeFileSync('style.css', css);
    fs.writeFileSync('style.min.css', css); // Just overwrite to make sure we don't desync
    console.log('Hover rule added');
} else {
    console.log('Hover rule already exists');
}
