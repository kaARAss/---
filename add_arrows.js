const fs = require('fs');
let seats = fs.readFileSync('seats.js', 'utf8');

// The current thumbsCol code starts at:
/*
    const thumbsCol = document.createElement('div');
    thumbsCol.style.display = 'flex';
*/
// We need to wrap thumbsCol in a container with arrows.
// BUT wait, it's easier to just add arrows to the existing bodyContainer before thumbsCol.

seats = seats.replace(/const thumbsCol = document\.createElement\('div'\);/, `
    const thumbsWrapper = document.createElement('div');
    thumbsWrapper.className = 'thumbs-wrapper';
    thumbsWrapper.style.display = 'flex';
    thumbsWrapper.style.alignItems = 'center';
    thumbsWrapper.style.gap = '10px';
    thumbsWrapper.style.width = '100%';

    const leftArrow = document.createElement('button');
    leftArrow.innerHTML = '&#10094;';
    leftArrow.className = 'thumb-arrow thumb-arrow-left';
    leftArrow.style.background = 'transparent';
    leftArrow.style.border = 'none';
    leftArrow.style.color = '#f8e7bc';
    leftArrow.style.fontSize = '24px';
    leftArrow.style.cursor = 'pointer';

    const rightArrow = document.createElement('button');
    rightArrow.innerHTML = '&#10095;';
    rightArrow.className = 'thumb-arrow thumb-arrow-right';
    rightArrow.style.background = 'transparent';
    rightArrow.style.border = 'none';
    rightArrow.style.color = '#f8e7bc';
    rightArrow.style.fontSize = '24px';
    rightArrow.style.cursor = 'pointer';

    const thumbsCol = document.createElement('div');
    thumbsCol.className = 'thumbs-col';
`);

seats = seats.replace(/bodyContainer\.appendChild\(thumbsCol\);/, `
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
`);

fs.writeFileSync('seats.js', seats);
console.log('Replaced');
