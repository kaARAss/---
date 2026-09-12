const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');
css = css.replace(/transform: scale\(1\.05\);/g, "transform: scaleX(1.05);");
css = css.replace(/transform: scale\(1\.02\);/g, "transform: scaleX(1.02);");
css = css.replace(/transform: scale\(1\);/g, "transform: scaleX(1);");
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss = mincss.replace(/transform:scale\(1\.05\)/g, "transform:scaleX(1.05)");
mincss = mincss.replace(/transform:scale\(1\.02\)/g, "transform:scaleX(1.02)");
mincss = mincss.replace(/transform:scale\(1\)/g, "transform:scaleX(1)");
fs.writeFileSync('style.min.css', mincss);

console.log('Changed banner scale to scaleX');
