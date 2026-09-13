const fs = require('fs');

let seatsJs = fs.readFileSync('seats.js', 'utf8');

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
            
            imgBg.style.position = 'absolute';
            imgBg.style.top = '0';
            imgBg.style.left = '0';
            imgBg.style.width = '100%';
            imgBg.style.height = '100%';
            imgBg.style.objectFit = 'cover';
            imgBg.style.transform = 'none';
            
            eventItem.style.cursor = 'pointer';
            eventItem.addEventListener('click', function(e) {
                // If they didn't click the button directly, trigger the button logic
                if (e.target !== button) {
                    button.click();
                }
            });
        }
        content.appendChild(button);
        eventItem.appendChild(content);
`;

const targetStr = /if \(!monthData\.is_custom_image\) \{[\s\S]*?eventItem\.appendChild\(content\);/

seatsJs = seatsJs.replace(targetStr, replacementStr);
fs.writeFileSync('seats.js', seatsJs);
console.log('Fixed click on whole card');
