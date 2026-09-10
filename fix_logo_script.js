const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const script = `
<script>
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.getElementById('animated-logo');
    const wrapper = document.getElementById('logo-wrapper');
    
    if (!logo || !wrapper) return;
    
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
                    
                    // The distance we need to move the logo to the center
                    const moveX = centerX - wrapperCenterX;
                    
                    // The scale amount
                    const scale = window.innerWidth < 768 ? 2 : 3.5;
                    // Move it down vertically as well
                    const moveY = window.innerWidth < 768 ? 60 : 100;
                    
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
    
    // Slight delay to ensure layout is calculated
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

html = html + '\n' + script + '\n</body></html>';

fs.writeFileSync('index.html', html);
console.log('Script added');
