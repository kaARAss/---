const fs = require('fs');

const modalCSS = `
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
`;

let html = fs.readFileSync('index.html', 'utf8');
if (html.includes('<!-- END ULTIMATE MOBILE FIX -->')) {
    html = html.replace('<!-- END ULTIMATE MOBILE FIX -->', modalCSS + '\n<!-- END ULTIMATE MOBILE FIX -->');
}
fs.writeFileSync('index.html', html);
console.log('Appended modal CSS to index.html');
