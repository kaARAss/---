const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Give header an ID so we can target it easily if needed, or just use querySelector
html = html.replace(/<header style="">/, '<header id="main-header" style="">');

// 2. Change the transition of the animated logo to be slower and smoother (1.2s ease-in-out)
html = html.replace(
    /transition: all 0.6s cubic-bezier\(0.25, 1, 0.5, 1\);/,
    'transition: all 1.2s ease-in-out;'
);

// 3. Replace the script block with the updated logic
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
                    // Move it higher as requested
                    const moveY = window.innerWidth < 768 ? 20 : 30;
                    
                    logo.style.transform = \`translate(\${moveX}px, \${moveY}px) scale(\${scale})\`;
                    header.classList.add('transparent-bg');
                });
            }
        } else {
            if (isAtTop !== false) {
                isAtTop = false;
                requestAnimationFrame(() => {
                    logo.style.transform = 'translate(0px, 0px) scale(1)';
                    header.classList.remove('transparent-bg');
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
console.log('Script updated with slower animation and background logic');
