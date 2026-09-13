const fs = require('fs');

let mincss = fs.readFileSync('style.min.css', 'utf8');

// The problematic block that was appended
const badBlock = ".events .event-seasons .event-item .content { width: 42% !important; height: 86.6% !important; top: 6.8% !important; left: 4.5% !important; padding: 10% !important; box-sizing: border-box;}.events .event-seasons .event-item .overlay-image { width: 42% !important; height: 86.6% !important; max-width: none !important; max-height: none !important; top: 6.8% !important; left: 4.5% !important;}@media only screen and (max-width: 760px) { .events .event-item .content h2 { font-size: 24px !important; margin-bottom: 5px !important; } .events .event-item .content .card-divider { margin: 5px 0 !important; } .events .event-item .content .card-subtitle { font-size: 12px !important; margin-bottom: 10px !important; } .events .event-item .content .event-item_button { font-size: 14px !important; padding: 8px 16px !important; margin-top: 10px; }}";

mincss = mincss.replace(badBlock, '');

// Also remove v3 so we can start fresh
mincss = mincss.replace(/\/\* Modern Mobile Cards for Events v3 \*\/[\s\S]*$/, '');

fs.writeFileSync('style.min.css', mincss);

let css = fs.readFileSync('style.css', 'utf8');
css = css.replace(/\/\* Modern Mobile Cards for Events v3 \*\/[\s\S]*$/, '');
fs.writeFileSync('style.css', css);

console.log('Cleaned CSS files');
