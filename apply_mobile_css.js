const fs = require('fs');

const cssToAdd = `
/* Modern Mobile Cards for Events v4 */
@media only screen and (max-width: 760px) {
    #events .event-seasons {
        display: flex !important;
        flex-direction: column !important;
        gap: 20px !important;
        padding: 0 15px !important;
    }

    #events .event-seasons .event-item {
        display: flex !important;
        flex-direction: column !important;
        aspect-ratio: auto !important;
        height: auto !important;
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        background-color: #111 !important;
        border: 1px solid #333 !important;
        margin-bottom: 0 !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
        position: relative !important;
        padding: 0 !important;
        align-items: stretch !important;
    }
    
    #events .event-seasons .event-item .background-image {
        position: relative !important;
        width: 100% !important;
        height: 220px !important;
        object-fit: cover !important;
        object-position: right top !important; /* Keep the girls in view */
        display: block !important;
        border-radius: 0 !important;
        max-width: none !important;
    }
    
    #events .event-seasons .event-item .overlay-image {
        display: none !important;
    }
    
    #events .event-seasons .event-item .content {
        position: relative !important;
        width: 100% !important;
        height: auto !important;
        top: 0 !important;
        left: 0 !important;
        padding: 24px 20px !important;
        box-sizing: border-box !important;
        background: linear-gradient(to bottom, #1a1a1a, #0a0a0a) !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
        transform: none !important;
        border-top: 2px solid #8b1014 !important; /* Elegant red accent line */
    }
    
    #events .event-seasons .event-item .content h2 {
        font-size: 26px !important;
        margin: 0 0 12px 0 !important;
        color: #f8e7bc !important;
        line-height: 1.2 !important;
        text-align: center !important;
        width: 100% !important;
        font-family: Rosemaria, serif !important;
    }
    
    #events .event-seasons .event-item .content .card-divider {
        display: none !important; /* Hide original divider, we use top border */
    }
    
    #events .event-seasons .event-item .content .card-subtitle {
        font-size: 15px !important;
        margin: 0 0 24px 0 !important;
        color: #ddd !important;
        line-height: 1.5 !important;
        text-align: center !important;
        width: 100% !important;
        font-family: Onest, sans-serif !important;
    }
    
    #events .event-seasons .event-item .content .event-item_button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 16px !important;
        padding: 14px 28px !important;
        margin: 0 !important;
        white-space: nowrap !important;
        width: 100% !important; /* Full width button on mobile */
        max-width: 280px !important;
        background-color: #8b1014 !important;
        color: #fff !important;
        border-radius: 8px !important;
        text-decoration: none !important;
        font-weight: 500 !important;
        font-family: Onest, sans-serif !important;
        border: none !important;
        transition: background-color 0.3s !important;
    }
    
    #events .event-seasons .event-item .content .event-item_button img {
        margin-left: 10px !important;
        width: 16px !important;
        filter: brightness(0) invert(1) !important;
    }
}
`;

let css = fs.readFileSync('style.css', 'utf8');
css += cssToAdd;
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += cssToAdd.replace(/\n/g, '').replace(/\s+/g, ' ');
fs.writeFileSync('style.min.css', mincss);

console.log('Mobile CSS v4 applied');
