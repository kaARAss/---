const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const fixCss = `
<style>
/* FORCE NAVBAR TO ABSOLUTE TOP ON MOBILE */
@media only screen and (max-width: 1024px) {
    header#main-header {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        background-color: #1a1a1a !important; /* Make it solid so it looks like a navbar */
        height: 70px !important;
        padding: 0 15px !important;
        display: flex !important;
        align-items: center !important;
        z-index: 9999 !important;
    }
    
    header#main-header .menu {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
    }
    
    header#main-header #logo-wrapper {
        margin-top: 0 !important;
        height: 100% !important;
        padding: 5px 0 !important;
        display: flex !important;
        align-items: center !important;
    }
    
    header#main-header #animated-logo {
        height: 50px !important; /* Slightly smaller to fit nicely */
        margin: 0 !important;
        transform: none !important;
    }
    
    body {
        padding-top: 70px !important; /* Push body content down so banner isn't hidden under navbar */
    }
    
    /* Fix menu open position */
    header#main-header .menu ul.active {
        top: 70px !important;
        height: calc(100vh - 70px) !important;
    }
    
    /* Adjust banner padding since body now has padding-top */
    .banner_main {
        padding-top: 40px !important;
    }
}
</style>
`;

html = html.replace('</head>', fixCss + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Applied navbar top fix');
