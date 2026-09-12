const fs = require('fs');
let js = fs.readFileSync('seats.js', 'utf8');

// The issue with ESC key is likely a general event listener in seats.js or page-transition.js
// But looking at the createEventTickets code, the popup is a div appended to body.
// To add a backdrop and fix ESC:

const newCode = `
// Append backdrop handler
const style = document.createElement('style');
style.textContent = \`
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    z-index: 1005; /* Just below modal */
    display: none;
    backdrop-filter: blur(5px);
}
.event_tickets {
    z-index: 1006 !important;
}
\`;
document.head.appendChild(style);

const backdrop = document.createElement('div');
backdrop.className = 'modal-backdrop';
document.body.appendChild(backdrop);

backdrop.addEventListener('click', () => {
    document.querySelectorAll('.event_tickets').forEach(t => t.style.display = 'none');
    backdrop.style.display = 'none';
    document.body.classList.remove('no-scroll');
});

// Fix ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.event_tickets[style*="display: flex"]');
        if (openModal) {
            openModal.style.display = 'none';
            backdrop.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }
    }
});
`;

if (!js.includes('.modal-backdrop')) {
    js += '\n' + newCode;
    
    // Patch openEventTickets to show backdrop
    js = js.replace(/eventTickets\.style\.display = 'flex';/g, "eventTickets.style.display = 'flex';\n    document.querySelector('.modal-backdrop').style.display = 'block';");
    
    // Patch close button in createEventTickets
    js = js.replace(/eventTickets\.style\.display = 'none';\s*document\.body\.classList\.remove\('no-scroll'\);/g, "eventTickets.style.display = 'none';\n        document.querySelector('.modal-backdrop').style.display = 'none';\n        document.body.classList.remove('no-scroll');");

    fs.writeFileSync('seats.js', js);
    console.log('Fixed popup background and ESC key');
} else {
    console.log('Already fixed');
}
