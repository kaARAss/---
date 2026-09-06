document.addEventListener('DOMContentLoaded', () => {
    // Select all meaningful links and buttons
    const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        link.addEventListener('click', async function(e) {
            const href = this.getAttribute('href');
            
            // Do not intercept if it's the dropdown toggler on mobile
            if (this.classList.contains('about-show') && window.innerWidth <= 1024) {
                return; 
            }
            
            // Do not intercept modal triggers or empty links
            if (this.classList.contains('certs_buy') || this.classList.contains('certs_check') || 
                this.classList.contains('order_event') || this.classList.contains('close_management-tickets') ||
                this.classList.contains('close_cert_popup') || this.classList.contains('close_event_popup') ||
                this.id.includes('step')) {
                return;
            }

            if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                
                // STOP actual navigation to keep AI Studio preview from breaking!
                e.preventDefault();
                
                if (href === '#' || href === '/') return;
                // If it's a hash link on the same page, let it scroll naturally (or handle smoothly)
                if (href.startsWith('#') && href.length > 1) {
                    const targetId = href.replace(/\/$/, '');
                    const targetEl = document.querySelector(targetId) || document.getElementById(targetId.substring(1));
                    if (targetEl) {
                        e.preventDefault();
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                    return;
                }

                
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
                overlay.removeAttribute('hidden');
                overlay.style.pointerEvents = 'all';
                overlay.style.opacity = '1';
                
                const white = overlay.querySelector('.intro__white');
                const gray = overlay.querySelector('.intro__bg');
                const star = overlay.querySelector('.intro__star');
                const container = document.querySelector('.banner_image');
                const anchor = document.getElementById('star-anchor');
                const header = document.querySelector('header');
                
                if (gray) {
                    gray.style.opacity = '1';
                }
                if (star) {
                    star.style.opacity = '0';
                    const sApp = star.animate([
                        { opacity: 0, transform: 'translate(-50%,-50%) scale(0.05) rotate(-120deg)' },
                        { opacity: 1, transform: 'translate(-50%,-50%) scale(1) rotate(0deg)' }
                    ], { duration: 400, fill: 'forwards', easing: 'ease-out' });
                    await sApp.finished;
                }

                if (white) {
                    try {
                        const expand = white.animate([
                            { clipPath: 'circle(0% at 50% 50%)', WebkitClipPath: 'circle(0% at 50% 50%)' },
                            { clipPath: 'circle(150% at 50% 50%)', WebkitClipPath: 'circle(150% at 50% 50%)' }
                        ], { duration: 600, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'forwards' });
                        await expand.finished;
                        
                        // Reset positions for opening
                        white.style.clipPath = 'circle(150% at 50% 50%)';
                        white.style.WebkitClipPath = 'circle(150% at 50% 50%)';
                        
                        if (header) header.style.transform = 'translateY(-50%)';
                        document.documentElement.classList.add('intro-lock');
                        
                        await new Promise(r => setTimeout(r, 200)); // fake network delay
                        
                        const whiteCollapse = white.animate([
                            { clipPath:'circle(150% at 50% 50%)', WebkitClipPath:'circle(150% at 50% 50%)' },
                            { clipPath:'circle(0% at 50% 50%)',   WebkitClipPath:'circle(0% at 50% 50%)' }
                        ], { duration: 600, easing:'cubic-bezier(.2,.7,.1,1)', fill:'forwards' });
                        
                        const starAppear = star.animate([
                            { opacity:0, transform:'translate(-50%,-50%) scale(0.2) rotate(0deg)' },
                            { opacity:1, transform:'translate(-50%,-50%) scale(0.8) rotate(0deg)' }
                        ], { duration: 250, easing:'ease-out', fill:'forwards' });
                        
                        await whiteCollapse.finished;
                        await starAppear.finished;
                        
                        const starGrow100 = star.animate([
                            { transform:'translate(-50%,-50%) scale(1.0) rotate(0deg)' },
                            { transform:'translate(-50%,-50%) scale(1.5) rotate(-45deg)' }
                        ], { duration: 250, easing:'cubic-bezier(.1,.9,1,1)', fill:'forwards' });
                        
                        await starGrow100.finished;
                        
                        // Fly to anchor
                        const v = { x: innerWidth/2, y: innerHeight/2 };
                        const r = anchor?.getBoundingClientRect();
                        const target = r ? { x: r.left + r.width/2, y: r.top + r.height/2 } : v;
                        const dx = target.x - v.x;
                        const dy = target.y - v.y;
                        
                        const starFlyToAnchor = star.animate([
                            { transform:`translate(calc(-50% + 0px), calc(-50% + 0px)) scale(1.5) rotate(-45deg)` },
                            { transform:`translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.05) rotate(-120deg)` }
                        ], { duration: 500, easing:'cubic-bezier(.5,.5,1,1)', fill:'forwards' });
                        
                        await starFlyToAnchor.finished;
                        
                        document.documentElement.classList.remove('intro-lock');
                        overlay.style.pointerEvents = 'none';
                        
                        const fadeGray = gray.animate([{opacity:1},{opacity:0}], {
                            duration: 300, easing:'cubic-bezier(.5,.5,1,1)', fill:'forwards'
                        });
                        
                        const headerDrop = header?.animate?.(
                            [{ transform: 'translateY(-30%)' }, { transform: 'translateY(0%)' }],
                            { duration: 400, easing: 'cubic-bezier(.3,.3,1,1)', fill: 'forwards' }
                        );
                        
                        headerDrop?.finished.then(() => { if (header) header.style.transform = ''; });
                        
                        const burst = star.animate([
                            { transform: 'translate(-50%,-50%) scale(0.05) rotate(-120deg)' },
                            { transform: 'translate(-50%,-50%) scale(2.25) rotate(0deg)' }
                        ], { duration: 300, easing:'cubic-bezier(.5,.5,1,1)', fill:'forwards' });
                        
                        await Promise.all([fadeGray.finished, burst.finished, headerDrop?.finished ?? Promise.resolve()]);
                        await new Promise(r => setTimeout(r, 300));
                        
                        await star.animate([{opacity:1},{opacity:0}], { duration: 300, fill:'forwards' }).finished;
                        await overlay.animate([{opacity:1},{opacity:0}], { duration: 200, fill:'forwards' }).finished;
                        
                    } catch (e) {
                        console.error(e);
                    } finally {
                        if (overlay && overlay.parentNode) overlay.remove();
                        document.documentElement.classList.remove('intro-lock');
                    }
                } else {
                    // fallback
                }
            }
        });
    });
});
