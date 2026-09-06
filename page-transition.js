document.addEventListener('DOMContentLoaded', () => {
    // Select all links in the navbar, plus other major call-to-action buttons
    const links = document.querySelectorAll('.nav-links a, .red_button, .black_button, .event-item_button');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Do not intercept if it's the dropdown toggler on mobile
            if (this.classList.contains('about-show') && window.innerWidth <= 1024) {
                return; 
            }
            
            // Do not intercept cert modal triggers
            if (this.classList.contains('certs_buy') || this.classList.contains('certs_check')) {
                return;
            }

            // Only intercept valid cross-page links
            if (href && href !== '#' && href !== '/' && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                // Check if it's an anchor link on the same page
                if (href.startsWith('#') || href.includes('#')) {
                    const [path, hash] = href.split('#');
                    // If the path is the current page, it's just a scroll, let it be.
                    // For the preview, most hrefs are like https://burlesqueshow.ru/...
                    // If it's a completely different URL, we'll intercept.
                }

                e.preventDefault();
                
                // Re-create overlay if missing
                let overlay = document.getElementById('intro');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'intro';
                    overlay.innerHTML = `
                        <div class="intro__bg"></div>
                        <div class="intro__white"></div>
                        <img class="intro__star" src="./star.svg" alt="">
                    `;
                    document.body.appendChild(overlay);
                }
                
                overlay.hidden = false;
                overlay.style.pointerEvents = 'all';
                overlay.style.opacity = '1';
                
                const white = overlay.querySelector('.intro__white');
                const gray = overlay.querySelector('.intro__bg');
                const star = overlay.querySelector('.intro__star');
                
                if (gray) {
                    gray.style.opacity = '1';
                }
                if (star) {
                    star.style.opacity = '0';
                    star.animate([
                        { opacity: 0, transform: 'translate(-50%,-50%) scale(0.05) rotate(-120deg)' },
                        { opacity: 1, transform: 'translate(-50%,-50%) scale(1) rotate(0deg)' }
                    ], { duration: 400, fill: 'forwards', easing: 'ease-out' });
                }

                if (white) {
                    const expand = white.animate([
                        { clipPath: 'circle(0% at 50% 50%)', WebkitClipPath: 'circle(0% at 50% 50%)' },
                        { clipPath: 'circle(150% at 50% 50%)', WebkitClipPath: 'circle(150% at 50% 50%)' }
                    ], { duration: 600, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'forwards' });

                    expand.finished.then(() => {
                        window.location.href = href;
                    });
                } else {
                    setTimeout(() => {
                        window.location.href = href;
                    }, 600);
                }
            }
        });
    });
});
