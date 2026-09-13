const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const oldScript = `    function updateLogoPosition() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        if (scrollY < 50) {
            if (isAtTop !== true) {
                isAtTop = true;
                requestAnimationFrame(() => {
                    const rect = wrapper.getBoundingClientRect();
                    const centerX = window.innerWidth / 2;
                    const wrapperCenterX = rect.left + rect.width / 2;
                    
                    const moveX = (centerX - wrapperCenterX) - 20; // Смещаем на 5мм влево (изначально 3мм + еще 2мм)
                    
                    // Масштаб оставляем как просили в прошлый раз
                    const scale = window.innerWidth < 768 ? 1.9 : 2.4;
                    // Опускаем еще на 3мм (+12 пикселей)
                    const moveY = window.innerWidth < 768 ? 36 : 40;
                    
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
        }
    }`;

const newScript = `    function updateLogoPosition() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const isMobile = window.innerWidth < 768;
        
        if (scrollY < 50 && !isMobile) {
            if (isAtTop !== true) {
                isAtTop = true;
                requestAnimationFrame(() => {
                    const rect = wrapper.getBoundingClientRect();
                    const centerX = window.innerWidth / 2;
                    const wrapperCenterX = rect.left + rect.width / 2;
                    
                    const moveX = (centerX - wrapperCenterX) - 20;
                    const scale = 2.4;
                    const moveY = 40;
                    
                    logo.style.transform = \`translate(\${moveX}px, \${moveY}px) scale(\${scale})\`;
                    header.style.backgroundColor = 'transparent';
                });
            }
        } else {
            if (isAtTop !== false) {
                isAtTop = false;
                requestAnimationFrame(() => {
                    logo.style.transform = 'translate(0px, 0px) scale(1)';
                    // На мобильных хедер всегда должен иметь фон, если не нужны другие эффекты. 
                    // Но по дизайну возможно при скролле < 50 он прозрачный. Оставим прозрачным если < 50, иначе темный.
                    header.style.backgroundColor = (scrollY < 50) ? 'transparent' : '#1a1a1a';
                });
            }
        }
    }`;

if (html.includes(oldScript)) {
    html = html.replace(oldScript, newScript);
    fs.writeFileSync('index.html', html);
    console.log('Script replaced successfully');
} else {
    console.log('Script not found, checking with regex');
    // regex fallback
    const regex = /function updateLogoPosition\(\) \{[\s\S]*?\}\s*\}\s*setTimeout/m;
    if (regex.test(html)) {
        html = html.replace(regex, newScript + '\n    \n    setTimeout');
        fs.writeFileSync('index.html', html);
        console.log('Script replaced with regex');
    } else {
        console.log('Not found at all');
    }
}
