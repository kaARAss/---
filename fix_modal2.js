const fs = require('fs');

const modalCSS = `
    .new_modal_layout .modal-body-container > div:first-child {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
    .new_modal_layout .modal-body-container > div:first-child::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }
`;

let html = fs.readFileSync('index.html', 'utf8');
if (html.includes('<!-- END ULTIMATE MOBILE FIX -->')) {
    html = html.replace('<!-- END ULTIMATE MOBILE FIX -->', modalCSS + '\n<!-- END ULTIMATE MOBILE FIX -->');
}
fs.writeFileSync('index.html', html);
console.log('Appended modal CSS to index.html');
