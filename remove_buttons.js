const fs = require('fs');
let seatsJs = fs.readFileSync('seats.js', 'utf8');

const targetStr = `        const button = document.createElement('a');
        button.className = 'black_button event-item_button';
        button.innerHTML = 'Подробнее <img src="./more-arrow.svg" alt="arrow" style="width: 16px; margin-left: 5px;">';
        
        button.href = '#';
        button.dataset.month = \`\${monthNum}/\${year}\`;

        button.addEventListener('click', function(e) {
            e.preventDefault();

            const existingModal = document.querySelector(\`#event_tickets_\${monthYear}\`);

            if (existingModal) {
                openEventTickets(monthYear);
                return;
            }

            const eventTickets = createEventTickets(monthData, index);
            document.body.appendChild(eventTickets);
            openEventTickets(monthYear);
        });
        
        
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
            if (monthData.image.includes('show1')) {
                imgBg.style.objectPosition = 'left center'; 
                imgBg.style.transform = 'scale(1.05)'; 
                imgBg.style.transformOrigin = 'left center';
            } else if (monthData.image.includes('show2')) {
                imgBg.style.objectPosition = 'left center';
                imgBg.style.transform = 'scale(1.15)'; // Увеличил еще больше
                imgBg.style.transformOrigin = 'left center';
            } else if (monthData.image.includes('show3')) {
                imgBg.style.objectPosition = 'center 35%'; 
                imgBg.style.transform = 'none';
            } else {
                imgBg.style.objectPosition = 'center';
                imgBg.style.transform = 'none';
            }
            
            eventItem.style.cursor = 'pointer';
            eventItem.addEventListener('click', function(e) {
                // If they didn't click the button directly, trigger the button logic
                if (e.target !== button) {
                    button.click();
                }
            });
        }
        content.appendChild(button);`;

const replacementStr = `        
        eventItem.style.cursor = 'pointer';
        eventItem.addEventListener('click', function(e) {
            e.preventDefault();
            const existingModal = document.querySelector(\`#event_tickets_\${monthYear}\`);
            if (existingModal) {
                openEventTickets(monthYear);
                return;
            }
            const eventTickets = createEventTickets(monthData, index);
            document.body.appendChild(eventTickets);
            openEventTickets(monthYear);
        });
        
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
            if (monthData.image.includes('show1')) {
                imgBg.style.objectPosition = 'left center'; 
                imgBg.style.transform = 'scale(1.05)'; 
                imgBg.style.transformOrigin = 'left center';
            } else if (monthData.image.includes('show2')) {
                imgBg.style.objectPosition = 'left center';
                imgBg.style.transform = 'scale(1.15)'; // Увеличил еще больше
                imgBg.style.transformOrigin = 'left center';
            } else if (monthData.image.includes('show3')) {
                imgBg.style.objectPosition = 'center 35%'; 
                imgBg.style.transform = 'none';
            } else {
                imgBg.style.objectPosition = 'center';
                imgBg.style.transform = 'none';
            }
        }`;

seatsJs = seatsJs.replace(targetStr, replacementStr);
fs.writeFileSync('seats.js', seatsJs);
console.log('Buttons removed');
