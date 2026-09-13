const fs = require('fs');

const cssOverride = `
/* SUPER OVERRIDE FOR EVENT CARDS TEXT */
html body .events .event-seasons .event-item .content h2,
html body .events .event-item .content h2,
html body #events .event-seasons .event-item .content h2 {
    font-family: 'Onest', sans-serif !important;
    font-size: 18px !important;
    line-height: 1.2 !important;
    margin: 0 !important;
    padding-top: 25px !important;
    padding-bottom: 5px !important;
    text-transform: uppercase !important;
    letter-spacing: 0 !important;
}

html body .events .event-seasons .event-item .content .card-subtitle,
html body .events .event-item .content .card-subtitle,
html body #events .event-seasons .event-item .content .card-subtitle {
    font-family: 'Onest', sans-serif !important;
    font-size: 12px !important;
    line-height: 1.3 !important;
    margin: 0 !important;
    padding-left: 15px !important;
    padding-right: 15px !important;
    font-weight: 300 !important;
    color: #fff !important;
}

html body .events .event-seasons .event-item .content,
html body .events .event-item .content,
html body #events .event-seasons .event-item .content {
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 0 !important;
    box-sizing: border-box !important;
}

html body .events .event-seasons .event-item .card-divider,
html body .events .event-item .card-divider {
    margin: 8px 0 !important;
    width: 60% !important;
}

html body .events .event-seasons .event-item .event-item_button,
html body .events .event-item .event-item_button {
    margin-top: 10px !important;
    padding: 6px 14px !important;
    font-size: 13px !important;
}

html body .events .event-seasons .event-item .overlay-image,
html body .events .event-item .overlay-image {
    top: 0 !important;
    left: 0 !important;
    position: absolute !important;
    pointer-events: none !important;
    object-fit: contain !important;
    width: 100% !important;
    height: 100% !important;
}
`;

function appendTo(file) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content += '\n' + cssOverride + '\n';
        fs.writeFileSync(file, content);
        console.log('Appended to ' + file);
    }
}

appendTo('style.css');
appendTo('style.min.css');
appendTo('style_pretty.css');
