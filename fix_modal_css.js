const fs = require('fs');

const modalCSS = `
/* ULTIMATE MODAL MOBILE CSS FIX */
@media only screen and (max-width: 900px) {
    .new_modal_layout .modal-body-container {
        flex-direction: column !important;
        align-items: center !important; /* Center contents vertically */
    }
    
    .new_modal_layout .modal-body-container > div:nth-child(2) {
        /* This is the Main Frame (video block) */
        width: 100% !important;
        max-width: 100% !important;
        height: 250px !important;
        min-height: 250px !important;
        margin: 0 auto !important;
    }
    
    .new_modal_layout .modal-body-container > div:first-child {
        /* This is the Thumbs Col */
        flex-direction: row !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 80px !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        padding-right: 0 !important;
        justify-content: flex-start !important;
        order: 2 !important; /* Put below the video */
        margin-top: 15px !important;
    }
    
    .new_modal_layout .modal-body-container > div:first-child > div {
        /* Thumbnails */
        width: 120px !important;
        height: 70px !important;
    }
    
    .new_modal_layout .modal-body-container > div:nth-child(3) {
        /* Details col */
        width: 100% !important;
        order: 3 !important; /* Put at the bottom */
        align-items: center !important;
        text-align: center !important;
    }
    
    .new_modal_layout .modal-body-container > div:nth-child(3) > div {
        /* text description */
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
        padding: 0 40px !important; /* give space for close btn */
    }
}
`;

let html = fs.readFileSync('index.html', 'utf8');
if (html.includes('<!-- END ULTIMATE MOBILE FIX -->')) {
    html = html.replace('<!-- END ULTIMATE MOBILE FIX -->', modalCSS + '\n<!-- END ULTIMATE MOBILE FIX -->');
}
fs.writeFileSync('index.html', html);
console.log('Appended modal CSS to index.html');
