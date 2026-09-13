const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldScriptRegex = /<script>[\s\S]*?const logo = document\.getElementById\('animated-logo'\);[\s\S]*?wrapperCenterX \= rect\.left \+ rect\.width \/ 2;[\s\S]*?moveX = \(centerX - wrapperCenterX\) - 20;[\s\S]*?<\/script>/;

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
                    if (window.innerWidth < 768) {
                        // On mobile, keep it in the top left corner, don't center or scale
                        logo.style.transform = 'translate(0px, 0px) scale(1)';
                    } else {
                        const rect = wrapper.getBoundingClientRect();
                        const centerX = window.innerWidth / 2;
                        const wrapperCenterX = rect.left + rect.width / 2;
                        
                        const moveX = (centerX - wrapperCenterX) - 20; 
                        
                        const scale = 2.4;
                        const moveY = 40;
                        
                        logo.style.transform = \`translate(\${moveX}px, \${moveY}px) scale(\${scale})\`;
                    }
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
    }
    
    window.addEventListener('scroll', updateLogoPosition, { passive: true });
    window.addEventListener('resize', () => { isAtTop = null; updateLogoPosition(); }, { passive: true });
    setTimeout(updateLogoPosition, 100);
});
</script>
`;

html = html.replace(oldScriptRegex, newScript.trim());
fs.writeFileSync('index.html', html);
console.log('Fixed logo on mobile');
