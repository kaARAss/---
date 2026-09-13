const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = '.new_modal_layout *::-webkit-scrollbar { display: none !important; }';
const replaceStr = targetStr + `
    .new_modal_layout { scrollbar-width: none !important; -ms-overflow-style: none !important; }
    .new_modal_layout * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
`;

if (html.includes(targetStr) && !html.includes('scrollbar-width: none')) {
    html = html.replace(targetStr, replaceStr);
    fs.writeFileSync('index.html', html);
    console.log('HTML scrollbars hidden');
}
