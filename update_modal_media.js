const fs = require('fs');
let seatsJs = fs.readFileSync('seats.js', 'utf8');

const regex = /const tVideo = createThumb[\s\S]*?mainImg\.textContent = \`Просмотр: \$\{t\.textContent\.replace\('▶ ',\s*''\)\}\`;\s*\}\);\s*\}\);/m;

const replacement = `
    const mediaItems = monthData.media || [
        { type: 'video', label: 'Видео', url: '' },
        { type: 'image', label: 'Фото 1', url: '' },
        { type: 'image', label: 'Фото 2', url: '' },
        { type: 'image', label: 'Фото 3', url: '' },
        { type: 'image', label: 'Фото 4', url: '' }
    ];

    const thumbsElements = [];
    mediaItems.forEach((item, i) => {
        const thumb = createThumb(item.label, item.type === 'video');
        if (i === 0) thumb.style.border = '2px solid #f8e7bc';
        thumbsCol.appendChild(thumb);
        thumbsElements.push({ el: thumb, data: item });
    });

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
    mainFrame.style.position = 'relative';

    const mainDisplay = document.createElement('div');
    mainDisplay.style.width = '100%';
    mainDisplay.style.height = '100%';
    mainDisplay.style.display = 'flex';
    mainDisplay.style.alignItems = 'center';
    mainDisplay.style.justifyContent = 'center';
    mainDisplay.style.color = '#777';
    mainDisplay.style.fontFamily = 'Onest, sans-serif';
    mainDisplay.style.fontSize = '18px';
    mainFrame.appendChild(mainDisplay);
    
    function renderMedia(item) {
        mainDisplay.innerHTML = '';
        if (!item.url) {
            mainDisplay.textContent = 'Здесь будет большое ' + (item.type === 'video' ? 'видео' : 'фото');
            return;
        }
        
        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.url;
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain';
            mainDisplay.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            mainDisplay.appendChild(img);
        }
    }
    
    // Initial render
    if (mediaItems.length > 0) {
        renderMedia(mediaItems[0]);
    }

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
    desc.innerHTML = monthData.detailsText || \`
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

    leftArrow.addEventListener('click', (e) => {
        e.preventDefault();
        thumbsCol.scrollBy({ left: -100, behavior: 'smooth' });
        thumbsCol.scrollBy({ top: -100, behavior: 'smooth' }); // for desktop vertical scroll
    });
    rightArrow.addEventListener('click', (e) => {
        e.preventDefault();
        thumbsCol.scrollBy({ left: 100, behavior: 'smooth' });
        thumbsCol.scrollBy({ top: 100, behavior: 'smooth' }); // for desktop vertical scroll
    });

    thumbsWrapper.appendChild(leftArrow);
    thumbsWrapper.appendChild(thumbsCol);
    thumbsWrapper.appendChild(rightArrow);

    bodyContainer.appendChild(thumbsWrapper);
    bodyContainer.appendChild(mainFrame);
    bodyContainer.appendChild(detailsCol);

    eventTickets.appendChild(eventTitle);
    eventTickets.appendChild(hr);
    eventTickets.appendChild(bodyContainer);

    // Add interactivity to thumbs
    thumbsElements.forEach(thumbObj => {
        thumbObj.el.addEventListener('click', () => {
            thumbsElements.forEach(x => x.el.style.border = '2px solid #444');
            thumbObj.el.style.border = '2px solid #f8e7bc';
            renderMedia(thumbObj.data);
        });
    });
`;

if (regex.test(seatsJs)) {
    seatsJs = seatsJs.replace(regex, replacement);
    fs.writeFileSync('seats.js', seatsJs);
    console.log('Seats JS Modal Media implementation updated!');
} else {
    console.log('Could not find the replace block in seats.js');
}
