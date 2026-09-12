const fs = require('fs');
let js = fs.readFileSync('seats.js', 'utf8');

// Change where modal is appended
js = js.replace(/eventsSection\.appendChild\(eventTickets\);/g, "document.body.appendChild(eventTickets);");
js = js.replace(/eventsSection\.appendChild\(modal\);/g, "document.body.appendChild(modal);");

// Inject our new style
const newStyle = `
const modalStyle = document.createElement('style');
modalStyle.textContent = \`
body.hide-content-mode > *:not(.event_tickets):not(script):not(style):not(link) {
    display: none !important;
}
\`;
document.head.appendChild(modalStyle);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.event_tickets[style*="display: flex"]');
        if (openModal) {
            openModal.style.display = 'none';
            document.body.classList.remove('no-scroll');
            document.body.classList.remove('hide-content-mode');
        }
    }
});
`;

// Insert the new logic somewhere near the top of the file, e.g. after "const eventsSection = document.querySelector('.events');" if it exists, or just at the very end
js += "\n" + newStyle;

// Update openEventTickets
const openEventTicketsRegex = /(function openEventTickets\([^{]+\{\s*document\.querySelectorAll\('\.event_tickets'\)\.forEach\([^\)]+\)\;\s*const eventTickets = [^;]+\;\s*if \(\!eventTickets\) \{\s*return\;\s*\}\s*modalName = monthYear\;\s*eventTickets\.style\.display = 'flex'\;\s*document\.body\.classList\.add\('no-scroll'\)\;)/;

if (openEventTicketsRegex.test(js)) {
    js = js.replace(openEventTicketsRegex, "$1\n    document.body.classList.add('hide-content-mode');");
} else {
    console.log("Could not find openEventTickets logic");
}

// Update close button handler inside createEventTickets
const closeLogicRegex = /eventTickets\.style\.display = 'none';\s*document\.body\.classList\.remove\('no-scroll'\);/g;
js = js.replace(closeLogicRegex, "eventTickets.style.display = 'none';\n        document.body.classList.remove('no-scroll');\n        document.body.classList.remove('hide-content-mode');");

fs.writeFileSync('seats.js', js);
console.log('Fixed modal behavior');
