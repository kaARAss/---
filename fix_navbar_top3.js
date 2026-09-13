const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const fixCss = `
<style>
/* ULTIMATE HEADER TOP FIX FOR ALL DEVICES */
html, body {
    margin: 0 !important;
    padding: 0 !important;
}
header#main-header {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 15px !important;
    background-color: #1a1a1a !important; /* Solid dark background to prevent bleed */
    height: 70px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    z-index: 999999 !important;
    box-sizing: border-box !important;
    transform: none !important; /* Prevent any transforms from pushing it down */
}
header#main-header[style] {
    background-color: #1a1a1a !important;
    transform: none !important;
    top: 0 !important;
}

header#main-header .menu {
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
}

header#main-header #logo-wrapper {
    margin: 0 !important;
    padding: 0 !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
}

header#main-header #animated-logo {
    margin: 0 !important;
    height: 44px !important;
    transform: none !important; /* override the JS completely */
}

body {
    padding-top: 70px !important; /* prevent content from hiding under the solid header */
}

/* Fix mobile menu position */
header#main-header .menu ul.active {
    top: 70px !important;
    height: calc(100vh - 70px) !important;
}

/* Make sure banner doesn't have weird spacing */
.banner_main {
    padding-top: 20px !important;
}
</style>
`;

// Remove previous fixes if they exist
html = html.replace(/<style>\s*\/\* FORCE NAVBAR TO ABSOLUTE TOP ON MOBILE \*\/[\s\S]*?<\/style>/g, '');
html = html.replace(/<style>\s*\/\* ULTIMATE HEADER TOP FIX FOR ALL DEVICES \*\/[\s\S]*?<\/style>/g, '');

html = html.replace('</head>', fixCss + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Applied ultimate navbar top fix 3');
