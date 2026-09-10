const fs = require('fs');

let css = fs.readFileSync('style.min.css', 'utf8');
css = css.replace(/Banner_tiffany\.png/g, 'Banner.png');
css = css.replace(/Banner_hover_tiffany\.png/g, 'Banner_hover.png');
css = css.replace(/Banner_mobile_tiffany\.png/g, 'Banner_mobile.png');
css = css.replace(/Banner_tablet_tiffany\.png/g, 'Banner_tablet.png');
css = css.replace(/Banner_mobile_tiffany\.webp/g, 'Banner_mobile.webp');
fs.writeFileSync('style.min.css', css);

let css2 = fs.readFileSync('style.css', 'utf8');
css2 = css2.replace(/Banner_tiffany\.png/g, 'Banner.png');
css2 = css2.replace(/Banner_hover_tiffany\.png/g, 'Banner_hover.png');
css2 = css2.replace(/Banner_mobile_tiffany\.png/g, 'Banner_mobile.png');
css2 = css2.replace(/Banner_tablet_tiffany\.png/g, 'Banner_tablet.png');
css2 = css2.replace(/Banner_mobile_tiffany\.webp/g, 'Banner_mobile.webp');
fs.writeFileSync('style.css', css2);

console.log('Reverted Tiffany banners to red.');
