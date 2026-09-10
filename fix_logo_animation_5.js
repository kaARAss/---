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
                    
                    const scale = window.innerWidth < 768 ? 2 : 3.5;
                    // Original was 100 on desktop, 60 on mobile.
                    // 1cm higher is roughly 30px less. So 70 and 40.
                    const moveY = window.innerWidth < 768 ? 40 : 70;
                    
                    logo.style.transform = \`translate(\${moveX}px, \${moveY}px) scale(\${scale})\`;
                    
                    // We removed the transparent background logic because it exposes the body's black color
                    // and requires moving the banner up (which user disliked).
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
console.log('Script updated back to original background logic');
