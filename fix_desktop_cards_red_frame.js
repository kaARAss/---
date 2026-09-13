const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const fixCss = `
<style>
/* Make the red frame border scale nicely */
.events .event-seasons .event-item .overlay-image {
    pointer-events: none !important;
}

/* Make sure the text area matches the frame exactly */
.events .event-seasons .event-item .content {
    top: 7% !important; /* adjust top to match frame padding */
    height: 85% !important; /* keep it inside the frame */
}
</style>
`;

html = html.replace('</head>', fixCss + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Fixed red frame alignment');
