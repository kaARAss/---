const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update the logo img tag
html = html.replace(
    /<a href="#">\s*<img src="\.\/logo\.png" alt="logo" style="height: 72px; width: auto; mix-blend-mode: screen; margin-top: 5px;">\s*<\/a>/,
    `<a href="#" id="logo-wrapper" style="display: block; width: 140px; height: 72px; margin-top: 5px;">
            <img id="animated-logo" src="./logo.png" alt="logo" style="height: 72px; width: auto; mix-blend-mode: screen; transform-origin: center center; transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);">
        </a>`
);

// Add the JS script before </body>
const script = `
<script>
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.getElementById('animated-logo');
    const wrapper = document.getElementById('logo-wrapper');
    
    if (!logo || !wrapper) return;
    
    let isAtTop = true;
    
    function updateLogoPosition() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        if (scrollY < 50) {
            if (!isAtTop || !logo.style.transform) {
                isAtTop = true;
                // Calculate translation to center
                const rect = wrapper.getBoundingClientRect();
                // viewport center X
                const centerX = window.innerWidth / 2;
                // wrapper center X
                const wrapperCenterX = rect.left + rect.width / 2;
                
                const moveX = centerX - wrapperCenterX;
                const moveY = 60; // push it down a bit
                
                logo.style.transform = \`translate(\${moveX}px, \${moveY}px) scale(2.5)\`;
            }
        } else {
            if (isAtTop) {
                isAtTop = false;
                logo.style.transform = 'translate(0px, 0px) scale(1)';
            }
        }
    }
    
    // Initial position
    updateLogoPosition();
    
    // On scroll
    window.addEventListener('scroll', updateLogoPosition);
    window.addEventListener('resize', updateLogoPosition);
});
</script>
`;

html = html.replace(/<\/body>/, `${script}\n</body>`);

fs.writeFileSync('index.html', html);
console.log('Logo animation updated in index.html');
