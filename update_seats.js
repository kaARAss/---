const fs = require('fs');

let seatsJs = fs.readFileSync('seats.js', 'utf8');

// We need to replace the appending logic in seats.js
const targetStr = `        content.appendChild(title);
        content.appendChild(divider);
        content.appendChild(subtitle);
        content.appendChild(button);

        eventItem.appendChild(imgBg);
        eventItem.appendChild(imgOverlay);
        eventItem.appendChild(content);`;

const replacementStr = `
        if (!monthData.is_custom_image) {
            content.appendChild(title);
            content.appendChild(divider);
            content.appendChild(subtitle);
            eventItem.appendChild(imgBg);
            eventItem.appendChild(imgOverlay);
        } else {
            content.classList.add('custom-image-content');
            eventItem.appendChild(imgBg);
            // Make background image fit the whole container normally
            imgBg.style.position = 'absolute';
            imgBg.style.top = '0';
            imgBg.style.left = '0';
            imgBg.style.width = '100%';
            imgBg.style.height = '100%';
            imgBg.style.objectFit = 'cover';
            imgBg.style.transform = 'none';
        }
        content.appendChild(button);
        eventItem.appendChild(content);
`;

seatsJs = seatsJs.replace(targetStr, replacementStr);
fs.writeFileSync('seats.js', seatsJs);
console.log('Updated seats.js');
