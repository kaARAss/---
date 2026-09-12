const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
`                    const scale = window.innerWidth < 768 ? 1.4 : 1.7;
                    // Опускаем еще на ~1мм (+4 пикселя, итого 20px на десктопе, 16px на мобилках)
                    const moveY = window.innerWidth < 768 ? 16 : 20;
                    
                    logo.style.transform = \`translate(\${moveX}px, \${moveY}px) scale(\${scale})\`;
                });
            }
        } else {
            if (isAtTop !== false) {
                isAtTop = false;
                requestAnimationFrame(() => {
                    logo.style.transform = 'translate(0px, 0px) scale(1)';
                });
            }
        }`,
`                    const scale = window.innerWidth < 768 ? 1.6 : 2.0;
                    // Опускаем еще на 2мм (+8 пикселей)
                    const moveY = window.innerWidth < 768 ? 24 : 28;
                    
                    logo.style.transform = \`translate(\${moveX}px, \${moveY}px) scale(\${scale})\`;
                    header.style.backgroundColor = 'transparent';
                });
            }
        } else {
            if (isAtTop !== false) {
                isAtTop = false;
                requestAnimationFrame(() => {
                    logo.style.transform = 'translate(0px, 0px) scale(1)';
                    header.style.backgroundColor = '#1a1a1a';
                });
            }
        }`
);

fs.writeFileSync('index.html', html);
console.log('index.html updated successfully.');
