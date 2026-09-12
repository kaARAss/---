const fs = require('fs');

// 1. Remove red button width override
let css = fs.readFileSync('style.css', 'utf8');
css = css.replace("/* Override red button width to allow text to fit */\nheader .buttons .red_button, header .mobile-only .red_button {\n    max-width: fit-content !important;\n    padding: 10px 24px !important;\n}\n", "");
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss = mincss.replace("header .buttons .red_button, header .mobile-only .red_button{max-width:fit-content!important;padding:10px 24px!important}", "");
fs.writeFileSync('style.min.css', mincss);

// 2. Increase banner size slightly (5% instead of 10%)
css += `
/* Make the ticket banner slightly bigger */
.banner_image {
    transform: scale(1.05);
    transform-origin: center top;
}
@media only screen and (max-width: 1024px) {
    .banner_image {
        transform: scale(1.02);
    }
}
@media only screen and (max-width: 760px) {
    .banner_image {
        transform: scale(1);
    }
}
`;
fs.writeFileSync('style.css', css);

mincss += '.banner_image{transform:scale(1.05);transform-origin:center top}@media only screen and (max-width:1024px){.banner_image{transform:scale(1.02)}}@media only screen and (max-width:760px){.banner_image{transform:scale(1)}}';
fs.writeFileSync('style.min.css', mincss);

console.log('Fixed everything');
