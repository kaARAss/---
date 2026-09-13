const fs = require('fs');

const cssOverride = `
/* Custom image content layout */
html body .events .event-seasons .event-item .content.custom-image-content,
html body .events .event-item .content.custom-image-content,
html body #events .event-seasons .event-item .content.custom-image-content {
    justify-content: flex-end !important;
    align-items: flex-end !important;
    padding: 20px !important;
}

/* Allow hovering over the full card to click the button maybe? Or just keep button at bottom right */
`;

function appendTo(file) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content += '\n' + cssOverride + '\n';
        fs.writeFileSync(file, content);
    }
}

appendTo('style.css');
appendTo('style.min.css');
console.log('Added CSS');
