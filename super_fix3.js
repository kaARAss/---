const fs = require('fs');

const cssOverride = `
/* ABSOLUTE CENTER AND OVERRIDE ALL PADDINGS */
html body .events .event-seasons .event-item .content,
html body .events .event-item .content,
html body #events .event-seasons .event-item .content {
    top: 0 !important;
    left: 0 !important;
    width: 228px !important;
    height: 311px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 0 10px !important;
    box-sizing: border-box !important;
    position: absolute !important;
    background: transparent !important;
}

html body .events .event-seasons .event-item .content h2,
html body .events .event-item .content h2 {
    font-family: 'Onest', sans-serif !important;
    font-size: 18px !important;
    line-height: 1.1 !important;
    margin: 0 0 10px 0 !important;
    padding: 0 !important;
    text-transform: uppercase !important;
    letter-spacing: 0 !important;
    text-align: center !important;
    color: #f8e7bc !important;
    width: 100% !important;
}

html body .events .event-seasons .event-item .content .card-subtitle,
html body .events .event-item .content .card-subtitle {
    font-family: 'Onest', sans-serif !important;
    font-size: 12px !important;
    line-height: 1.3 !important;
    margin: 0 0 15px 0 !important;
    padding: 0 !important;
    font-weight: 300 !important;
    color: #fff !important;
    text-align: center !important;
    width: 100% !important;
}

html body .events .event-seasons .event-item .card-divider,
html body .events .event-item .card-divider {
    margin: 0 0 10px 0 !important;
    width: 60% !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
    border-top: 1px solid rgba(255,255,255,0.4) !important;
}

html body .events .event-seasons .event-item .event-item_button,
html body .events .event-item .event-item_button {
    margin: 0 !important;
    padding: 8px 16px !important;
    font-size: 13px !important;
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
