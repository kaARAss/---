const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const mobileCSS = `
/* Modern Mobile Cards for Events */
@media only screen and (max-width: 760px) {
    .events .event-item {
        display: flex !important;
        flex-direction: column !important;
        aspect-ratio: auto !important;
        height: auto !important;
        border-radius: 12px;
        overflow: hidden;
        background-color: #8b1014 !important; /* Deep red for the card body */
        border: 1px solid #444;
        margin-bottom: 20px;
    }
    
    .events .event-item .background-image {
        position: relative !important;
        width: 100% !important;
        height: 220px !important;
        object-fit: cover !important;
        object-position: top center !important;
    }
    
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
        border-top: 2px solid #f8e7bc;
    }
    
    .events .event-item .content h2 {
        font-size: 24px !important;
        margin-bottom: 8px !important;
        color: #f8e7bc !important;
        line-height: 1.2 !important;
    }
    
    .events .event-item .content .card-divider {
        width: 100% !important;
        border-top: 1px solid rgba(248, 231, 188, 0.4) !important;
        margin: 12px 0 !important;
    }
    
    .events .event-item .content .card-subtitle {
        font-size: 14px !important;
        margin-bottom: 20px !important;
        color: #fff !important;
        line-height: 1.4 !important;
    }
    
    .events .event-item .content .event-item_button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 14px !important;
        padding: 10px 20px !important;
        margin-top: 0 !important;
        white-space: nowrap !important;
        width: auto !important;
        background-color: #1a1a1a !important;
        color: #fff !important;
        border-radius: 4px !important;
        text-decoration: none !important;
    }
    
    .events .event-item .content .event-item_button img {
        margin-left: 8px !important;
        width: 14px !important;
    }
}
`;

css += mobileCSS;
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += mobileCSS.replace(/\n/g, '').replace(/\s+/g, ' ');
fs.writeFileSync('style.min.css', mincss);

console.log('Mobile cards CSS applied');
