const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the previous script
html = html.replace(/<script>\s*document\.addEventListener\('DOMContentLoaded', function\(\) {[\s\S]*?<\/script>\s*<\/body>/,
`<script>
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.getElementById('animated-logo');
    const wrapper = document.getElementById('logo-wrapper');
    
    if (!logo || !wrapper) return;
    
    let isAtTop = null; // force initial update
    
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
                    
                    // On mobile, scale less to fit screen
                    const scale = window.innerWidth < 768 ? 1.8 : 2.5;
                    const moveY = window.innerWidth < 768 ? 40 : 60;
                    
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
    
    // Initial position
    updateLogoPosition();
    
    // On scroll
    window.addEventListener('scroll', updateLogoPosition, { passive: true });
    
    // On resize, recalculate if at top
    window.addEventListener('resize', () => {
        if (isAtTop) {
            isAtTop = null; // force recalculation
            updateLogoPosition();
        }
    }, { passive: true });
});
</script>
</body>`
);

fs.writeFileSync('index.html', html);
console.log('Logo animation logic improved');
