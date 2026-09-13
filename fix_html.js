const fs = require('fs');

const ultimateCSS = `
/* ULTIMATE MOBILE CSS FIX */
@media only screen and (max-width: 760px) {
    #events, .events, #events .event-seasons, .events .event-seasons {
        display: flex !important;
        flex-direction: column !important;
        gap: 20px !important;
        padding: 0 15px !important;
        width: 100% !important;
        max-width: 100vw !important;
        box-sizing: border-box !important;
    }

    #events .event-item, .events .event-item, .event-item {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: 400px !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        background: #111 !important;
        margin: 0 !important;
        padding: 0 !important;
        position: relative !important;
        transform: none !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
        opacity: 1 !important;
        visibility: visible !important;
        left: 0 !important;
        right: 0 !important;
        top: 0 !important;
    }
    
    .event-item .background-image {
        position: relative !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 220px !important;
        max-height: 220px !important;
        object-fit: cover !important;
        object-position: center top !important;
        display: block !important;
        transform: none !important; /* Fix the 55% translateX */
        left: 0 !important;
        right: 0 !important;
        border-radius: 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
    }
    
    .event-item .overlay-image {
        display: none !important;
    }
    
    .event-item .content {
        position: relative !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: 180px !important;
        background: linear-gradient(to bottom, #1a1a1a, #0a0a0a) !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
        padding: 24px 20px !important;
        box-sizing: border-box !important;
        transform: none !important;
        left: 0 !important;
        right: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
        border-top: 2px solid #8b1014 !important;
        z-index: 10 !important;
    }
    
    .event-item .content h2 {
        font-family: Rosemaria, serif !important;
        font-size: 26px !important;
        color: #f8e7bc !important;
        text-align: center !important;
        margin: 0 0 12px 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
        display: block !important;
    }
    
    .event-item .content .card-subtitle {
        font-family: Onest, sans-serif !important;
        font-size: 15px !important;
        color: #ddd !important;
        text-align: center !important;
        margin: 0 0 24px 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
        display: block !important;
    }
    
    .event-item .content hr.card-divider {
        display: none !important;
    }
    
    .event-item .content .event-item_button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        background-color: #8b1014 !important;
        color: #fff !important;
        font-size: 16px !important;
        padding: 14px 28px !important;
        border-radius: 8px !important;
        width: 100% !important;
        max-width: 280px !important;
        margin: 0 !important;
        text-decoration: none !important;
        font-family: Onest, sans-serif !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
    }
    
    .event-item .content .event-item_button img {
        margin-left: 10px !important;
        width: 16px !important;
        filter: brightness(0) invert(1) !important;
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
    }
}
`;

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<body', '<!-- ULTIMATE MOBILE FIX -->\n<style>\n' + ultimateCSS + '\n</style>\n<!-- END ULTIMATE MOBILE FIX -->\n<body');
fs.writeFileSync('index.html', html);
console.log('Appended to body');
