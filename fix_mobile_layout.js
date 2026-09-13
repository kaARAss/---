const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');
let mincss = fs.readFileSync('style.min.css', 'utf8');

// 1. Logo alignment on mobile
css += `
@media only screen and (max-width: 760px) {
    #logo-wrapper {
        justify-content: flex-start !important;
    }
}
`;
mincss += '@media only screen and (max-width:760px){#logo-wrapper{justify-content:flex-start!important}}';

// 2. Event item content scaling for all screens
// We can extract the percentage positioning from the desktop query and apply it globally.
// Looking at style.css:
// .events .event-seasons .event-item .content { width: 42% !important; ... }
// We can just add a global rule that overrides it.

css += `
/* Global scaling for event items so they look good on mobile too */
.events .event-seasons .event-item .content {
    width: 42% !important;
    height: 86.6% !important;
    top: 6.8% !important;
    left: 4.5% !important;
    padding: 10% !important;
    box-sizing: border-box;
}
.events .event-seasons .event-item .overlay-image {
    width: 42% !important;
    height: 86.6% !important;
    max-width: none !important;
    max-height: none !important;
    top: 6.8% !important;
    left: 4.5% !important;
}

@media only screen and (max-width: 760px) {
    .events .event-item .content h2 {
        font-size: 24px !important;
        margin-bottom: 5px !important;
    }
    .events .event-item .content .card-divider {
        margin: 5px 0 !important;
    }
    .events .event-item .content .card-subtitle {
        font-size: 12px !important;
        margin-bottom: 10px !important;
    }
    .events .event-item .content .event-item_button {
        font-size: 14px !important;
        padding: 8px 16px !important;
        margin-top: 10px;
    }
}
`;

fs.writeFileSync('style.css', css);
fs.writeFileSync('style.min.css', mincss);

// 3. Fix the button class in seats.js
let js = fs.readFileSync('seats.js', 'utf8');
js = js.replace(/button\.className = 'event-item_button';/g, "button.className = 'black_button event-item_button';\n        button.innerHTML = 'Подробнее <img src=\"./more-arrow.svg\" alt=\"arrow\" style=\"width: 16px; margin-left: 5px;\">';");
fs.writeFileSync('seats.js', js);

console.log('Applied fixes');
