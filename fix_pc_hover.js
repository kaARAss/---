const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const pcHoverCss = `<style>
/* FORCE DESKTOP HOVER COLOR CHANGE ANIMATION */
@media only screen and (min-width: 1025px) {
    #events .event-seasons .event-item:hover .background-image,
    .events .event-seasons .event-item:hover .background-image {
        filter: grayscale(0) !important;
        transition: filter 0.3s ease-in-out !important;
    }
    
    #events .event-seasons .event-item .background-image,
    .events .event-seasons .event-item .background-image {
        filter: grayscale(1) !important;
        transition: filter 0.3s ease-in-out !important;
    }
}
</style>`;

html = html.replace('</head>', pcHoverCss + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Fixed PC hover');
