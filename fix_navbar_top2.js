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
        background-color: #1a1a1a !important; /* Solid background */
        height: 70px !important;
        padding: 0 15px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        z-index: 9999 !important;
        box-sizing: border-box !important;
    }
    
    header#main-header .menu {
        height: 100% !important;
        width: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        flex: 1 !important;
    }
    
    header#main-header #logo-wrapper {
        margin-top: 0 !important;
        height: 100% !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
    }
    
    header#main-header #animated-logo {
        height: 44px !important; /* Perfect size for 70px header */
        margin: 0 !important;
        transform: none !important;
    }
    
    body {
        padding-top: 70px !important; /* Push body down */
    }
    
    /* Fix menu open position */
    header#main-header .menu ul.active {
        top: 70px !important;
        height: calc(100vh - 70px) !important;
    }
    
    /* Adjust banner padding to avoid huge gap */
    .banner_main {
        padding-top: 40px !important;
    }
    
    /* Override JS transparent styles */
    header#main-header[style] {
        background-color: #1a1a1a !important;
    }
}
</style>
`;

// replace previous fix if exists
html = html.replace(/<style>\s*\/\* FORCE NAVBAR TO ABSOLUTE TOP ON MOBILE \*\/[\s\S]*?<\/style>/, fixCss);
fs.writeFileSync('index.html', html);
console.log('Applied navbar top fix 2');
