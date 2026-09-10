const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newScript = `
<script>
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.getElementById('animated-logo');
    const wrapper = document.getElementById('logo-wrapper');
    const header = document.querySelector('header');
    
    if (!logo || !wrapper || !header) return;
    
    let isAtTop = null;
    
    function updateLogoPosition() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        if (scrollY < 50) {
            if (isAtTop !== true) {
                isAtTop = true;
                requestAnimationFrame(() => {
                    const rect = wrapper.getBoundingClientRect();
                    const centerX = window.innerWidth / 2;
                    const wrapperCenterX = rect.left + rect.width / 2;
                    
                    const moveX = centerX - wrapperCenterX;
                    
                    // Масштаб оставляем как просили в прошлый раз
                    const scale = window.innerWidth < 768 ? 1.4 : 1.7;
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
        }
    }
    
    setTimeout(updateLogoPosition, 50);
    
    window.addEventListener('scroll', updateLogoPosition, { passive: true });
    
    window.addEventListener('resize', () => {
        if (isAtTop) {
            isAtTop = null;
            updateLogoPosition();
        }
    }, { passive: true });
});
</script>
`;

html = html.replace(/<script>\s*document\.addEventListener\('DOMContentLoaded', function\(\) {\s*const logo = document\.getElementById\('animated-logo'\);[\s\S]*?<\/script>/, newScript.trim());

fs.writeFileSync('index.html', html);
console.log('Script updated: logo animation Y position adjusted (-1mm)');
