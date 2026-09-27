const fs = require('fs');
let styleCss = fs.readFileSync('style.css', 'utf8');

const newRules = `
/* Tablet Grid Fix */
@media only screen and (min-width: 761px) and (max-width: 1024px) {
    #events .event-seasons, .events .event-seasons {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 20px !important;
        padding: 0 15px !important;
        width: 100% !important;
        max-width: 100vw !important;
        box-sizing: border-box !important;
    }
    
    #events .event-seasons .event-item, .events .event-seasons .event-item {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        max-height: none !important;
        aspect-ratio: 540 / 359 !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        margin: 0 !important;
        scale: 1 !important;
    }

    /* Reset background images for all children, overriding the odd/even mess */
    #events .event-seasons .event-item .background-image,
    .events .event-seasons .event-item .background-image,
    .events .event-seasons .event-item:nth-child(odd) .background-image,
    .events .event-seasons .event-item:nth-child(even) .background-image {
        position: absolute !important;
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        max-height: none !important;
        object-fit: cover !important;
        transform: none !important;
    }

    #events .event-seasons .event-item .content,
    .events .event-seasons .event-item .content {
        position: absolute !important;
        width: 100% !important;
        height: 100% !important;
        top: 0 !important;
        left: 0 !important;
        max-width: none !important;
        max-height: none !important;
        background: rgba(0, 0, 0, 0.4) !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 20px !important;
        box-sizing: border-box !important;
    }
    
    #events .event-seasons .event-item .content.custom-image-content,
    .events .event-seasons .event-item .content.custom-image-content {
        background: transparent !important;
        justify-content: flex-end !important;
        padding-bottom: 30px !important;
    }
}
`;

if (!styleCss.includes('Tablet Grid Fix')) {
    styleCss += newRules;
    fs.writeFileSync('style.css', styleCss);
    console.log('Appended Tablet Grid Fix to style.css');
} else {
    console.log('Tablet Grid Fix already exists.');
}
