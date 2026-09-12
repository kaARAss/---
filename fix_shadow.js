const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');
css += `
.about .about_us .section_title,
.about .about_show h2 {
    text-shadow: 0px 4px 15px rgba(0, 0, 0, 1), 0px 0px 30px rgba(0, 0, 0, 0.8), 0px 0px 50px rgba(0, 0, 0, 0.8) !important;
}
`;
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += '.about .about_us .section_title,.about .about_show h2{text-shadow:0px 4px 15px rgba(0,0,0,1),0px 0px 30px rgba(0,0,0,0.8),0px 0px 50px rgba(0,0,0,0.8)!important}';
fs.writeFileSync('style.min.css', mincss);
