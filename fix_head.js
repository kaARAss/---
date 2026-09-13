const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// There is still a rogue </style> at line 25
html = html.replace('<meta name="twitter:card" content="summary_large_image"></style>', '<meta name="twitter:card" content="summary_large_image">');
html = html.replace('<meta name="twitter:card" content="summary_large_image">\n</style>', '<meta name="twitter:card" content="summary_large_image">');

fs.writeFileSync('index.html', html);
console.log('Fixed');
