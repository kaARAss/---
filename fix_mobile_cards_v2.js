const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

// The block we added before, we need to remove it from style.css
const oldMobileCSSRegex = /\/\* Modern Mobile Cards for Events \*\/[\s\S]*?\}\s*\}\s*\n/m;
css = css.replace(oldMobileCSSRegex, '');


// New, cleaner design for mobile
const newMobileCSS = `
/* Modern Mobile Cards for Events v2 */
@media only screen and (max-width: 760px) {
    .events .event-item {
        display: flex !important;
        flex-direction: column !important;
        aspect-ratio: auto !important;
        height: auto !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        background-color: #1a1a1a !important; /* Dark background instead of red */
        border: 1px solid #333 !important;
        margin-bottom: 24px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
        position: relative !important;
        padding: 0 !important;
    }
    
    .events .event-item .background-image {
        position: relative !important;
        width: 100% !important;
        height: 240px !important;
        object-fit: cover !important;
        object-position: center !important;
        display: block !important;
        border-radius: 0 !important;
    }
    
    /* Hide the red frame entirely on mobile */
    .events .event-seasons .event-item .overlay-image {
        display: none !important;
    }
    
    .events .event-seasons .event-item .content {
        position: relative !important;
        width: 100% !important;
        height: auto !important;
        top: 0 !important;
        left: 0 !important;
        padding: 24px 20px !important;
        box-sizing: border-box !important;
        background: none !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
    }
    
    .events .event-item .content h2 {
        font-size: 26px !important;
        margin-bottom: 8px !important;
        color: #f8e7bc !important;
        line-height: 1.2 !important;
        text-align: center !important;
        width: 100% !important;
        font-family: Rosemaria, serif !important;
    }
    
    .events .event-item .content .card-divider {
        width: 40px !important; /* Small elegant divider */
        border-top: 2px solid #8b1014 !important; /* Red accent */
        margin: 12px auto 16px auto !important;
    }
    
    .events .event-item .content .card-subtitle {
        font-size: 15px !important;
        margin-bottom: 24px !important;
        color: #ccc !important;
        line-height: 1.5 !important;
        text-align: center !important;
        width: 100% !important;
        font-family: Onest, sans-serif !important;
    }
    
    .events .event-item .content .event-item_button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 15px !important;
        padding: 12px 24px !important;
        margin-top: 0 !important;
        white-space: nowrap !important;
        width: auto !important;
        background-color: #8b1014 !important; /* Red button */
        color: #fff !important;
        border-radius: 8px !important;
        text-decoration: none !important;
        font-weight: 500 !important;
        font-family: Onest, sans-serif !important;
        border: none !important;
    }
    
    .events .event-item .content .event-item_button img {
        margin-left: 8px !important;
        width: 16px !important;
        filter: brightness(0) invert(1) !important; /* Make sure arrow is white */
    }
}
`;

css += newMobileCSS;
fs.writeFileSync('style.css', css);

// We should also replace it in min.css
let mincss = fs.readFileSync('style.min.css', 'utf8');

// Try to remove the old block from min.css (using a regex that matches the minified version)
const oldMinCSSRegex = /\/\* Modern Mobile Cards for Events \*\/.*?\}\}/;
mincss = mincss.replace(oldMinCSSRegex, '');

// If it was appended multiple times or slightly differently, let's just do a manual replace of key rules
mincss = mincss.replace(/background-color: #8b1014 !important;/g, '');

mincss += newMobileCSS.replace(/\n/g, '').replace(/\s+/g, ' ');
fs.writeFileSync('style.min.css', mincss);

console.log('Mobile cards CSS v2 applied');
