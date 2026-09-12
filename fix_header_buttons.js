const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');
css += `
header .buttons .red_button {
    white-space: nowrap;
    height: 44px; /* Same height as black_button might be */
    padding: 8px 16px !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
header .buttons {
    display: flex;
    align-items: center;
    gap: 12px;
}
header .buttons .black_button {
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px !important;
    margin: 0 !important;
}
`;
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += 'header .buttons .red_button{white-space:nowrap;height:44px;padding:8px 16px!important;display:inline-flex;align-items:center;justify-content:center}header .buttons{display:flex;align-items:center;gap:12px}header .buttons .black_button{height:44px;display:inline-flex;align-items:center;justify-content:center;padding:8px 16px!important;margin:0!important}';
fs.writeFileSync('style.min.css', mincss);

console.log('Fixed header buttons height and alignment');
