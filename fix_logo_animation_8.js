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
                    
                    // Делаем чуть-чуть больше (scale 1.55 вместо 1.4 на десктопе, 1.3 вместо 1.2 на мобилках)
                    const scale = window.innerWidth < 768 ? 1.3 : 1.55;
                    // Опускаем на ~2мм (8 пикселей)
                    const moveY = window.innerWidth < 768 ? 6 : 8;
                    
                    logo.style.transform = \`translate(\${moveX}px, \${moveY}px) scale(\${scale})\`;
                });
            }
        } else {
            if (isAtTop !== false) {
                isAtTop = false;
                requestAnimationFrame(() => {
                    // При скролле логотип возвращается на свое место слева и уменьшается до исходного размера (scale 1)
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
console.log('Script updated: logo animation scale and Y position adjusted');
