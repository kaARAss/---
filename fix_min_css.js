const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// The block we added to style.css in fix_mobile_layout.js:
const missingBlock = `.events .event-seasons .event-item .content {
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
}`;

let mincss = fs.readFileSync('style.min.css', 'utf8');

if (!mincss.includes('width: 42% !important')) {
    mincss += missingBlock.replace(/\n/g, '').replace(/\s+/g, ' ');
    fs.writeFileSync('style.min.css', mincss);
    console.log('Appended to style.min.css');
} else {
    console.log('Already in style.min.css');
}
