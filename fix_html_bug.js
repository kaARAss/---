const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The issue is an accidental unmatched </style> tag in the head and then inserting the CSS in the wrong place which causes it to be rendered as text.

// First, fix the head area if there's a rogue </style>
html = html.replace(/<\/style><link rel="stylesheet"/, '<link rel="stylesheet"');

// Replace any occurrence of our CSS blocks where we missed a <style> tag
// Notice in fix_modal_css.js and fix_modal3.js we just appended plain text without <style> tags!!!
html = html.replace('<!-- END ULTIMATE MOBILE FIX -->', '</style>\n<!-- END ULTIMATE MOBILE FIX -->');

// Let's just find the entire block and replace it correctly
const regex = /<!-- ULTIMATE MOBILE FIX -->[\s\S]*?<!-- END ULTIMATE MOBILE FIX -->/;
const cssContent = `
<!-- ULTIMATE MOBILE FIX -->
<style>
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

/* ULTIMATE MODAL MOBILE CSS FIX */
@media only screen and (max-width: 900px) {
    .new_modal_layout .modal-body-container {
        flex-direction: column !important;
        align-items: center !important;
    }
    
    .new_modal_layout .modal-body-container > div:nth-child(2) {
        width: 100% !important;
        max-width: 100% !important;
        height: 250px !important;
        min-height: 250px !important;
        margin: 0 auto !important;
    }
    
    .new_modal_layout .modal-body-container > div.thumbs-wrapper {
        flex-direction: row !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 80px !important;
        order: 2 !important;
        margin-top: 15px !important;
        justify-content: center !important;
    }
    
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumbs-col {
        flex-direction: row !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        height: 100% !important;
        -ms-overflow-style: none;
        scrollbar-width: none;
        padding-right: 0 !important;
        flex: 1 !important;
    }
    
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumbs-col::-webkit-scrollbar {
        display: none;
    }
    
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumbs-col > div {
        width: 120px !important;
        height: 70px !important;
    }
    
    .new_modal_layout .modal-body-container > div:nth-child(3) {
        width: 100% !important;
        order: 3 !important;
        align-items: center !important;
        text-align: center !important;
    }
    
    .new_modal_layout .modal-body-container > div:nth-child(3) > div {
        padding-right: 0 !important;
    }
    
    .new_modal_layout .modal-body-container > div:nth-child(3) > a.red_button {
        margin: 0 auto !important;
        display: inline-flex !important;
        justify-content: center !important;
    }

    .desktop-only-btn {
        display: none !important;
    }
    
    .new_modal_layout .event_title {
        justify-content: center !important;
    }
    
    .new_modal_layout .event_title h1 {
        text-align: center !important;
        padding: 0 40px !important;
    }
}

/* Desktop fixes for thumbs wrapper */
@media only screen and (min-width: 901px) {
    .new_modal_layout .modal-body-container > div.thumbs-wrapper {
        flex-direction: column !important;
        width: 140px !important;
        height: 100% !important;
    }
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumb-arrow-left {
        transform: rotate(90deg) !important;
    }
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumb-arrow-right {
        transform: rotate(90deg) !important;
    }
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumbs-col {
        flex-direction: column !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        width: 100% !important;
    }
}
</style>
<!-- END ULTIMATE MOBILE FIX -->
`;

html = html.replace(regex, cssContent);

fs.writeFileSync('index.html', html);
console.log('Fixed syntax bug');
