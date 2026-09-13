const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

const modalDescHtml = `<h3 style="color: #f8e7bc; margin-top: 0; font-size: 22px; font-weight: 500;">О шоу</h3><p style="margin-bottom: 15px;">✨ Завораживающее шоу светящихся крыльев, которое погружает в атмосферу магии, свободы и ночного неба. Это не просто танец — это настоящая феерия света, где реальность отступает перед волшебством.</p><p style="margin-bottom: 15px;">🌌 В полной темноте зала вспыхивают яркие огни. Они складываются в причудливые узоры, а затем — в образы таинственных птиц. Артисты, облаченные в светящиеся костюмы, движутся с невероятной грацией. Кажется, будто они парят в воздухе, а их крылья сотканы из тысяч мерцающих звезд. Зрители замирают, наблюдая за этим гипнотическим действом, которое дарит ощущение чуда и абсолютной свободы.</p><p style="margin-bottom: 15px;">💫 Каждое выступление — это история, рассказанная языком света и пластики. Она уносит прочь от повседневности, заставляя поверить в сказку. Это идеальный финал для любого вечера, который запомнится надолго.</p>`;

html = html.replace('"title":"Ночные птицы (световой номер)"', '"title":"Ночные птицы", "detailsText": ' + JSON.stringify(modalDescHtml));

// Put the short description back just in case
const newDescStr = '"description": "✨ Завораживающее шоу светящихся крыльев, которое погружает в атмосферу магии, свободы и ночного неба. Это не просто танец — это настоящая феерия света, где реальность отступает перед волшебством.\\n\\n🌌 В полной темноте зала вспыхивают яркие огни. Они складываются в причудливые узоры, а затем — в образы таинственных птиц. Артисты, облаченные в светящиеся костюмы, движутся с невероятной грацией. Кажется, будто они парят в воздухе, а их крылья сотканы из тысяч мерцающих звезд. Зрители замирают, наблюдая за этим гипнотическим действом, которое дарит ощущение чуда и абсолютной свободы.\\n\\n💫 Каждое выступление — это история, рассказанная языком света и пластики. Она уносит прочь от повседневности, заставляя поверить в сказку. Это идеальный финал для любого вечера, который запомнится надолго."';

html = html.replace(newDescStr, '"description":"Уникальное сочетание бурлеска и световых эффектов, погружающее в гипнотическую атмосферу ночи."');

fs.writeFileSync('index.html', html);

// 2. Update seats.js
let seats = fs.readFileSync('seats.js', 'utf8');

seats = seats.replace("heading.textContent = 'НАЗВАНИЕ МЕРОПРИЯТИЯ';", "heading.textContent = monthData.title || 'НАЗВАНИЕ МЕРОПРИЯТИЯ';");

// Make sure arrows are not appended
if (!seats.includes('// thumbsWrapper.appendChild(leftArrow);')) {
    seats = seats.replace('thumbsWrapper.appendChild(leftArrow);', '// thumbsWrapper.appendChild(leftArrow);');
}
if (!seats.includes('// thumbsWrapper.appendChild(rightArrow);')) {
    seats = seats.replace('thumbsWrapper.appendChild(rightArrow);', '// thumbsWrapper.appendChild(rightArrow);');
}

// In case the previous run did not do it or did it wrong, replace them securely:
// if it's already commented, we are fine.

fs.writeFileSync('seats.js', seats);

console.log('Fixed');
