const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');
const appendedCss = `
/* Make the ticket banner bigger */
.banner_image {
    transform: scale(1.1); /* Slightly enlarge */
    transform-origin: center top;
    max-width: 110%; /* Allow it to overflow a bit if needed */
    margin: 0 -5%; /* Re-center */
}

@media only screen and (max-width: 1024px) {
    .banner_image {
        transform: scale(1.05);
        margin: 0 -2.5%;
    }
}
@media only screen and (max-width: 760px) {
    .banner_image {
        transform: scale(1); /* No scale on mobile to avoid overflow issues */
        margin: 0;
    }
}
`;
css = css.replace(appendedCss, "");
fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
const appendedMinCss = '.banner_image{transform:scale(1.1);transform-origin:center top;max-width:110%;margin:0 -5%}@media only screen and (max-width:1024px){.banner_image{transform:scale(1.05);margin:0 -2.5%}}@media only screen and (max-width:760px){.banner_image{transform:scale(1);margin:0}}';
mincss = mincss.replace(appendedMinCss, "");
fs.writeFileSync('style.min.css', mincss);

console.log('Reverted banner size');
