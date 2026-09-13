const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// I will overwrite the ULTIMATE MODAL MOBILE CSS FIX part.
const newCss = `
/* ULTIMATE MODAL MOBILE CSS FIX */
@media only screen and (max-width: 900px) {
    .new_modal_layout {
        padding: 40px 20px 20px 20px !important; /* Add top padding for absolute close button */
    }

    .new_modal_layout .close_event_tickets {
        position: absolute !important;
        top: 15px !important;
        right: 15px !important;
        z-index: 100 !important;
        margin: 0 !important;
    }

    .new_modal_layout .event_title {
        margin-top: 10px !important;
        position: static !important; /* So the close btn can escape it if needed, or we keep relative */
    }

    .new_modal_layout .modal-body-container {
        flex-direction: column !important;
        align-items: center !important;
        overflow-y: auto !important; /* Allow scroll if needed, but we will hide the scrollbar */
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
    }
    .new_modal_layout .modal-body-container::-webkit-scrollbar {
        display: none !important;
    }
    
    .new_modal_layout::-webkit-scrollbar {
        display: none !important;
    }
    .new_modal_layout {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
    }

    .new_modal_layout .modal-body-container > div:nth-child(2) {
        width: 100% !important;
        max-width: 100% !important;
        height: 250px !important;
        min-height: 250px !important;
        margin: 0 auto !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
    }
    
    .new_modal_layout .modal-body-container > div.thumbs-wrapper {
        flex-direction: row !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 80px !important;
        order: 2 !important;
        margin-top: 15px !important;
        justify-content: space-between !important;
        align-items: center !important;
    }
    
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumb-arrow {
        display: block !important;
        flex-shrink: 0 !important;
        padding: 0 10px !important;
        font-size: 24px !important;
    }
    
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumbs-col {
        flex-direction: row !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        height: 100% !important;
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
        padding-right: 0 !important;
        flex: 1 !important;
        gap: 10px !important;
    }
    
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumbs-col::-webkit-scrollbar {
        display: none !important;
    }
    
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumbs-col > div {
        width: 120px !important;
        min-width: 120px !important; /* Ensure they don't shrink */
        height: 70px !important;
    }
    
    .new_modal_layout .modal-body-container > div:nth-child(3) {
        width: 100% !important;
        order: 3 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
    }
    
    .new_modal_layout .modal-body-container > div:nth-child(3) > div {
        padding-right: 0 !important;
        margin-bottom: 20px !important;
    }
    
    .new_modal_layout .modal-body-container > div:nth-child(3) > a.red_button {
        margin: 0 auto !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        width: 100% !important;
        max-width: 280px !important;
    }

    .desktop-only-btn {
        display: none !important;
    }
    
    .new_modal_layout .event_title {
        justify-content: center !important;
        width: 100% !important;
    }
    
    .new_modal_layout .event_title h1 {
        text-align: center !important;
        padding: 0 !important;
        width: 100% !important;
    }
}
`;

html = html.replace(/\/\* ULTIMATE MODAL MOBILE CSS FIX \*\/[\s\S]*?\/\* Desktop fixes for thumbs wrapper \*\//, newCss + '\n/* Desktop fixes for thumbs wrapper */');

// Also globally hide scrollbars for .event_tickets if it has any
if (!html.includes('::-webkit-scrollbar')) {
    // we added it in the media query, but let's also add a global rule just in case the orange scrollbar is from a global style
}

fs.writeFileSync('index.html', html);
console.log('Fixed CSS');
