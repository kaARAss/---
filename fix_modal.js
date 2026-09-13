const fs = require('fs');

let seats = fs.readFileSync('seats.js', 'utf8');

// Replace the eventTitle creation to center everything
seats = seats.replace(/const eventTitle = document\.createElement\('div'\);\s*eventTitle\.className = 'event_title';[\s\S]*?eventTitle\.appendChild\(closeBtn\);/m, `const eventTitle = document.createElement('div');
    eventTitle.className = 'event_title';
    eventTitle.style.display = 'flex';
    eventTitle.style.alignItems = 'center';
    eventTitle.style.justifyContent = 'center';
    eventTitle.style.marginBottom = '20px';
    eventTitle.style.padding = '0';
    eventTitle.style.position = 'relative'; // For close button positioning

    const prev = document.createElement('a');
    prev.className = 'black_button event_prev desktop-only-btn';
    prev.href = '#';
    prev.textContent = 'Предыдущее';
    prev.style.minWidth = '140px';
    prev.style.textAlign = 'center';
    prev.style.position = 'absolute';
    prev.style.left = '0';
    if (index === 0) {
        prev.style.opacity = '0.4';
        prev.style.pointerEvents = 'none';
    } else {
        prev.addEventListener('click', function(e) {
            e.preventDefault();
            openOrCreateEventTickets(index - 1);
        });
    }

    const heading = document.createElement('h1');
    heading.textContent = 'НАЗВАНИЕ МЕРОПРИЯТИЯ';
    heading.style.margin = '0';
    heading.style.fontSize = 'clamp(18px, 4vw, 32px)';
    heading.style.color = '#f8e7bc';
    heading.style.textAlign = 'center';
    heading.style.fontFamily = 'Playfair Display, serif';
    heading.style.flex = '1';

    const next = document.createElement('a');
    next.className = 'black_button event_next desktop-only-btn';
    next.href = '#';
    next.textContent = 'Следующее';
    next.style.minWidth = '140px';
    next.style.textAlign = 'center';
    next.style.position = 'absolute';
    next.style.right = '50px';
    if (index === window.monthsData.length - 1) {
        next.style.opacity = '0.4';
        next.style.pointerEvents = 'none';
    } else {
        next.addEventListener('click', function(e) {
            e.preventDefault();
            openOrCreateEventTickets(index + 1);
        });
    }

    const closeBtn = document.createElement('a');
    closeBtn.className = 'close_event_tickets';
    closeBtn.href = '#';
    closeBtn.innerHTML = \`<img src="./close_popup.svg" alt="close icon" style="width: 32px; height: 32px; filter: brightness(0) invert(1);">\`;
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '0';
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        eventTickets.style.display = 'none';
        document.body.classList.remove('no-scroll');
        document.body.classList.remove('hide-content-mode');
    });

    eventTitle.appendChild(prev);
    eventTitle.appendChild(heading);
    eventTitle.appendChild(next);
    eventTitle.appendChild(closeBtn);`);


// We will restructure the layout of bodyContainer entirely in CSS using media queries
fs.writeFileSync('seats.js', seats);

console.log("Replaced JS");
