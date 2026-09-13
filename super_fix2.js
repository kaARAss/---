const fs = require('fs');

const cssOverride = `
/* REVERT WIDTH/HEIGHT FOR CONTENT TO MATCH RED FRAME */
html body .events .event-seasons .event-item .content,
html body .events .event-item .content,
html body #events .event-seasons .event-item .content {
    top: 0 !important;
    left: 0 !important;
    width: 228px !important;
    height: 311px !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 20px !important;
    box-sizing: border-box !important;
    position: absolute !important;
}

html body .events .event-seasons .event-item:nth-child(even) .content {
    left: auto !important;
    right: 0 !important;
}

html body .events .event-seasons .event-item .overlay-image,
html body .events .event-item .overlay-image {
    top: 0 !important;
    left: 0 !important;
    width: 228px !important;
    height: 311px !important;
    object-fit: cover !important;
    position: absolute !important;
}

html body .events .event-seasons .event-item:nth-child(even) .overlay-image {
    left: auto !important;
    right: 0 !important;
}

@media (max-width: 1024px) {
    html body .events .event-seasons .event-item .content,
    html body .events .event-item .content,
    html body #events .event-seasons .event-item .content,
    html body .events .event-seasons .event-item .overlay-image,
    html body .events .event-item .overlay-image {
        width: 170px !important;
        height: 188px !important;
    }
    
    html body .events .event-seasons .event-item .content h2,
    html body .events .event-item .content h2 {
        font-size: 14px !important;
        padding-top: 10px !important;
    }
    
    html body .events .event-seasons .event-item .content .card-subtitle,
    html body .events .event-item .content .card-subtitle {
        font-size: 10px !important;
        padding-left: 5px !important;
        padding-right: 5px !important;
    }
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
