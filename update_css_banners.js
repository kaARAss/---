const fs = require('fs');
let css = fs.readFileSync('style.min.css', 'utf8');

css = css.replace(/Banner\.png/g, 'Banner_tiffany.png');
css = css.replace(/Banner_hover\.png/g, 'Banner_hover_tiffany.png');
css = css.replace(/Banner_mobile\.png/g, 'Banner_mobile_tiffany.png');
css = css.replace(/Banner_tablet\.png/g, 'Banner_tablet_tiffany.png');
css = css.replace(/Banner_mobile\.webp/g, 'Banner_mobile_tiffany.webp');

fs.writeFileSync('style.min.css', css);

let css2 = fs.readFileSync('style.css', 'utf8');
css2 = css2.replace(/Banner\.png/g, 'Banner_tiffany.png');
css2 = css2.replace(/Banner_hover\.png/g, 'Banner_hover_tiffany.png');
css2 = css2.replace(/Banner_mobile\.png/g, 'Banner_mobile_tiffany.png');
css2 = css2.replace(/Banner_tablet\.png/g, 'Banner_tablet_tiffany.png');
css2 = css2.replace(/Banner_mobile\.webp/g, 'Banner_mobile_tiffany.webp');

fs.writeFileSync('style.css', css2);
console.log('Done replacing image urls in CSS');
