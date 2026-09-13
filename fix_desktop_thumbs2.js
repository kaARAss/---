const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The desktop fixes media query needs to clear some stuff
const cssReplace = `
/* Desktop fixes for thumbs wrapper */
@media only screen and (min-width: 901px) {
    .new_modal_layout .modal-body-container > div.thumbs-wrapper {
        flex-direction: column !important;
        width: 140px !important;
        height: 100% !important;
        order: 1 !important;
        margin-top: 0 !important;
        justify-content: flex-start !important;
    }
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumb-arrow-left {
        transform: rotate(90deg) !important;
        margin-bottom: 10px !important;
    }
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumb-arrow-right {
        transform: rotate(90deg) !important;
        margin-top: 10px !important;
    }
    .new_modal_layout .modal-body-container > div.thumbs-wrapper .thumbs-col {
        flex-direction: column !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        width: 100% !important;
    }
}
`;

html = html.replace(/\/\* Desktop fixes for thumbs wrapper \*\/[\s\S]*?<\/style>/, cssReplace + '\n</style>');

fs.writeFileSync('index.html', html);
console.log('Fixed desktop thumbs layout');
