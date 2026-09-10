const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The moveY should be 70 on desktop (original 100 - ~30)
// and 40 on mobile (original 60 - ~20)

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
                    
                    // Slightly higher than original, but lower than the previous iteration
                    const scale = window.innerWidth < 768 ? 2 : 3.5;
                    const moveY = window.innerWidth < 768 ? 40 : 70;
                    
                    logo.style.transform = \`translate(\${moveX}px, \${moveY}px) scale(\${scale})\`;
                    
                    // Force transparent background via inline styles to override any specificity issues
                    header.style.setProperty('background-color', 'transparent', 'important');
                    header.style.setProperty('background', 'transparent', 'important');
                    header.style.transition = 'background-color 1s ease-in-out, background 1s ease-in-out';
                });
            }
        } else {
            if (isAtTop !== false) {
                isAtTop = false;
                requestAnimationFrame(() => {
                    logo.style.transform = 'translate(0px, 0px) scale(1)';
                    // Restore original black background
                    header.style.setProperty('background-color', '#1a1a1a', 'important');
                    header.style.setProperty('background', '#1a1a1a', 'important');
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
console.log('Script updated with exact position and forced transparent background');
