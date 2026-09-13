const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const hideCss = `
/* Hide ALL scrollbars in the modal */
.new_modal_layout, 
.new_modal_layout *, 
.thumbs-col, 
.modal-body-container > div {
    scrollbar-width: none !important;  /* Firefox */
    -ms-overflow-style: none !important;  /* IE and Edge */
}

.new_modal_layout::-webkit-scrollbar, 
.new_modal_layout *::-webkit-scrollbar, 
.thumbs-col::-webkit-scrollbar, 
.modal-body-container > div::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
}
`;

if (!css.includes('/* Hide ALL scrollbars in the modal */')) {
    css += hideCss;
    fs.writeFileSync('style.css', css);
    console.log('Scrollbars completely hidden');
}

