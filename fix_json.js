const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const regex = /window\.monthsData = (\[.*?\]);/;
const match = html.match(regex);

if (match) {
    let monthsData = JSON.parse(match[1]);
    
    // Update the first item
    monthsData[0].title = "Ночные птицы";
    monthsData[0].description = "Уникальное сочетание бурлеска и световых эффектов, погружающее в гипнотическую атмосферу ночи.";
    
    monthsData[0].detailsText = `
        <h3 style="color: #f8e7bc; margin-top: 0; font-size: 22px; font-weight: 500;">О шоу</h3>
        <p style="margin-bottom: 15px;">✨ Завораживающее шоу светящихся крыльев, которое погружает в атмосферу магии, свободы и ночного неба. Это не просто танец — это настоящая феерия света, где реальность отступает перед волшебством.</p>
        <p style="margin-bottom: 15px;">🌌 В полной темноте зала вспыхивают яркие огни. Они складываются в причудливые узоры, а затем — в образы таинственных птиц. Артисты, облаченные в светящиеся костюмы, движутся с невероятной грацией. Кажется, будто они парят в воздухе, а их крылья сотканы из тысяч мерцающих звезд. Зрители замирают, наблюдая за этим гипнотическим действом, которое дарит ощущение чуда и абсолютной свободы.</p>
        <p style="margin-bottom: 15px;">💫 Каждое выступление — это история, рассказанная языком света и пластики. Она уносит прочь от повседневности, заставляя поверить в сказку. Это идеальный финал для любого вечера, который запомнится надолго.</p>
    `;
    
    html = html.replace(regex, 'window.monthsData = ' + JSON.stringify(monthsData) + ';');
    fs.writeFileSync('index.html', html);
    console.log('JSON fixed');
} else {
    console.log('Could not find window.monthsData');
}

