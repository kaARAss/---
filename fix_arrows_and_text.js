const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const newDesc = "✨ Завораживающее шоу светящихся крыльев, которое погружает в атмосферу магии, свободы и ночного неба. Это не просто танец — это настоящая феерия света, где реальность отступает перед волшебством.<br><br>🌌 В полной темноте зала вспыхивают яркие огни. Они складываются в причудливые узоры, а затем — в образы таинственных птиц. Артисты, облаченные в светящиеся костюмы, движутся с невероятной грацией. Кажется, будто они парят в воздухе, а их крылья сотканы из тысяч мерцающих звезд. Зрители замирают, наблюдая за этим гипнотическим действом, которое дарит ощущение чуда и абсолютной свободы.<br><br>💫 Каждое выступление — это история, рассказанная языком света и пластики. Она уносит прочь от повседневности, заставляя поверить в сказку. Это идеальный финал для любого вечера, который запомнится надолго.";

html = html.replace('"title":"Ночные птицы (световой номер)"', '"title":"Ночные птицы"');
html = html.replace('"description":"Уникальное сочетание бурлеска и световых эффектов, погружающее в гипнотическую атмосферу ночи."', '"description": ' + JSON.stringify(newDesc));

fs.writeFileSync('index.html', html);

let seats = fs.readFileSync('seats.js', 'utf8');
seats = seats.replace('thumbsWrapper.appendChild(leftArrow);', '// thumbsWrapper.appendChild(leftArrow);');
seats = seats.replace('thumbsWrapper.appendChild(rightArrow);', '// thumbsWrapper.appendChild(rightArrow);');

fs.writeFileSync('seats.js', seats);
console.log('Done');
