const fs = require('fs');

let js = fs.readFileSync('seats.js', 'utf8');

// Replace createEventTickets function
const oldFuncStart = "function createEventTickets(monthData, index) {";
const oldFuncEndRegex = /function openOrCreateEventTickets\(targetIndex\) \{/;

let startIndex = js.indexOf(oldFuncStart);
if (startIndex === -1) {
    console.log('Could not find createEventTickets');
    process.exit(1);
}

let endIndex = js.search(oldFuncEndRegex);
if (endIndex === -1) {
    console.log('Could not find openOrCreateEventTickets');
    process.exit(1);
}

const newFunc = `
function createEventTickets(monthData, index) {
    const { monthText, year, monthNum, image } = monthData;
    const monthYear = \`\${monthNum}_\${year}\`;

    const eventTickets = document.createElement('div');
    eventTickets.className = 'event_tickets new_modal_layout';
    eventTickets.id = \`event_tickets_\${monthYear}\`;
    eventTickets.dataset.month = \`\${monthNum}/\${year}\`;
    
    // Apply modal styles inline to override existing css safely
    eventTickets.style.display = 'flex';
    eventTickets.style.flexDirection = 'column';
    eventTickets.style.width = '95vw';
    eventTickets.style.maxWidth = '1200px';
    eventTickets.style.height = '85vh';
    eventTickets.style.maxHeight = '800px';
    eventTickets.style.borderRadius = '16px';
    eventTickets.style.border = '1px solid #333';
    eventTickets.style.padding = '30px';
    eventTickets.style.boxSizing = 'border-box';
    eventTickets.style.boxShadow = '0 10px 40px rgba(0,0,0,0.8)';
    
    // Background - same as card or dark translucent
    if (image) {
        eventTickets.style.backgroundImage = \`linear-gradient(rgba(15,15,15,0.85), rgba(15,15,15,0.95)), url(\${image})\`;
        eventTickets.style.backgroundSize = 'cover';
        eventTickets.style.backgroundPosition = 'center';
    } else {
        eventTickets.style.backgroundColor = 'rgba(20, 20, 20, 0.95)';
    }

    const eventTitle = document.createElement('div');
    eventTitle.className = 'event_title';
    eventTitle.style.display = 'flex';
    eventTitle.style.alignItems = 'center';
    eventTitle.style.justifyContent = 'space-between';
    eventTitle.style.marginBottom = '20px';
    eventTitle.style.padding = '0'; // reset existing padding

    const prev = document.createElement('a');
    prev.className = 'black_button event_prev';
    prev.href = '#';
    prev.textContent = 'Предыдущее';
    prev.style.minWidth = '140px';
    prev.style.textAlign = 'center';
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
    heading.style.flex = '1';
    heading.style.fontFamily = 'Playfair Display, serif';

    const next = document.createElement('a');
    next.className = 'black_button event_next';
    next.href = '#';
    next.textContent = 'Следующее';
    next.style.minWidth = '140px';
    next.style.textAlign = 'center';
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
    closeBtn.style.marginLeft = '20px';
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        eventTickets.style.display = 'none';
        document.body.classList.remove('no-scroll');
    });

    eventTitle.appendChild(prev);
    eventTitle.appendChild(heading);
    eventTitle.appendChild(next);
    eventTitle.appendChild(closeBtn);

    const hr = document.createElement('hr');
    hr.style.borderColor = '#444';
    hr.style.margin = '0';

    const bodyContainer = document.createElement('div');
    bodyContainer.className = 'modal-body-container';
    bodyContainer.style.display = 'flex';
    bodyContainer.style.gap = '20px';
    bodyContainer.style.marginTop = '20px';
    bodyContainer.style.flex = '1';
    bodyContainer.style.overflow = 'hidden';

    // Left Column: Thumbnails
    const thumbsCol = document.createElement('div');
    thumbsCol.style.display = 'flex';
    thumbsCol.style.flexDirection = 'column';
    thumbsCol.style.gap = '15px';
    thumbsCol.style.width = '140px';
    thumbsCol.style.overflowY = 'auto';
    thumbsCol.style.paddingRight = '5px';

    const createThumb = (text, isVideo) => {
        const t = document.createElement('div');
        t.style.width = '100%';
        t.style.height = '90px';
        t.style.backgroundColor = 'rgba(0,0,0,0.5)';
        t.style.display = 'flex';
        t.style.alignItems = 'center';
        t.style.justifyContent = 'center';
        t.style.cursor = 'pointer';
        t.style.borderRadius = '8px';
        t.style.border = '2px solid #444';
        t.style.color = '#fff';
        t.style.fontFamily = 'Onest, sans-serif';
        t.style.fontSize = '14px';
        t.style.flexShrink = '0';
        t.style.transition = 'all 0.3s ease';
        t.textContent = text;
        if (isVideo) {
            t.innerHTML = \`▶ \${text}\`;
        }
        return t;
    };

    const tVideo = createThumb('Видео', true);
    const tPhoto1 = createThumb('Фото 1');
    const tPhoto2 = createThumb('Фото 2');
    const tPhoto3 = createThumb('Фото 3');
    const tPhoto4 = createThumb('Фото 4');
    
    tVideo.style.border = '2px solid #f8e7bc'; // initially selected

    thumbsCol.appendChild(tVideo);
    thumbsCol.appendChild(tPhoto1);
    thumbsCol.appendChild(tPhoto2);
    thumbsCol.appendChild(tPhoto3);
    thumbsCol.appendChild(tPhoto4);

    // Middle Column: Main Frame
    const mainFrame = document.createElement('div');
    mainFrame.style.flex = '1';
    mainFrame.style.backgroundColor = 'rgba(0,0,0,0.8)';
    mainFrame.style.borderRadius = '12px';
    mainFrame.style.border = '1px solid #333';
    mainFrame.style.display = 'flex';
    mainFrame.style.alignItems = 'center';
    mainFrame.style.justifyContent = 'center';
    mainFrame.style.overflow = 'hidden';

    const mainImg = document.createElement('div');
    mainImg.style.width = '100%';
    mainImg.style.height = '100%';
    mainImg.style.display = 'flex';
    mainImg.style.alignItems = 'center';
    mainImg.style.justifyContent = 'center';
    mainImg.style.color = '#777';
    mainImg.style.fontFamily = 'Onest, sans-serif';
    mainImg.style.fontSize = '18px';
    mainImg.textContent = 'Здесь будет большое видео';

    mainFrame.appendChild(mainImg);

    // Right Column: Details
    const detailsCol = document.createElement('div');
    detailsCol.style.width = '320px';
    detailsCol.style.display = 'flex';
    detailsCol.style.flexDirection = 'column';
    detailsCol.style.gap = '20px';
    detailsCol.style.padding = '10px 0';

    const desc = document.createElement('div');
    desc.style.flex = '1';
    desc.style.color = '#ccc';
    desc.style.fontFamily = 'Onest, sans-serif';
    desc.style.lineHeight = '1.6';
    desc.style.overflowY = 'auto';
    desc.style.paddingRight = '10px';
    desc.innerHTML = \`
        <h3 style="color: #f8e7bc; margin-top: 0; font-size: 22px; font-weight: 500;">О шоу</h3>
        <p style="margin-bottom: 15px;">Уникальные номера, потрясающие костюмы и незабываемые эмоции. Погрузитесь в атмосферу настоящего праздника.</p>
        <p>Расскажем все подробности позже!</p>
    \`;

    const orderBtn = document.createElement('a');
    orderBtn.className = 'red_button';
    orderBtn.href = 'https://vk.me/taisdanceschool'; // link to VK
    orderBtn.target = '_blank';
    orderBtn.textContent = 'Заказать мероприятие';
    orderBtn.style.textAlign = 'center';
    orderBtn.style.width = '100%';
    orderBtn.style.boxSizing = 'border-box';
    orderBtn.style.padding = '15px';
    orderBtn.style.fontSize = '16px';

    detailsCol.appendChild(desc);
    detailsCol.appendChild(orderBtn);

    bodyContainer.appendChild(thumbsCol);
    bodyContainer.appendChild(mainFrame);
    bodyContainer.appendChild(detailsCol);

    eventTickets.appendChild(eventTitle);
    eventTickets.appendChild(hr);
    eventTickets.appendChild(bodyContainer);

    // Add interactivity to thumbs
    const allThumbs = [tVideo, tPhoto1, tPhoto2, tPhoto3, tPhoto4];
    allThumbs.forEach(t => {
        t.addEventListener('click', () => {
            allThumbs.forEach(x => x.style.border = '2px solid #444');
            t.style.border = '2px solid #f8e7bc';
            mainImg.textContent = \`Просмотр: \${t.textContent.replace('▶ ', '')}\`;
        });
    });

    return eventTickets;
}

`;

js = js.substring(0, startIndex) + newFunc + js.substring(endIndex);

// Also we need to fix openEventTickets
const openFuncStart = "function openEventTickets(monthYear) {";
const openFuncEndRegex = /function loadEventsList\(eventTickets, monthNum, year\) \{/;

let openStartIndex = js.indexOf(openFuncStart);
let openEndIndex = js.search(openFuncEndRegex);

if (openStartIndex !== -1 && openEndIndex !== -1) {
    const newOpenFunc = `
function openEventTickets(monthYear) {
    document.querySelectorAll('.event_tickets').forEach(t => (t.style.display = 'none'));
    const eventTickets = document.querySelector(\`#event_tickets_\${monthYear}\`);
    if (!eventTickets) {
        return;
    }
    modalName = monthYear;
    eventTickets.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

`;
    js = js.substring(0, openStartIndex) + newOpenFunc + js.substring(openEndIndex);
}

fs.writeFileSync('seats.js', js);
console.log('Successfully replaced createEventTickets and openEventTickets');
