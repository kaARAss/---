document.addEventListener("DOMContentLoaded", () => {
    const selectors = [
        '.section_title',
        '.event-item',
        '.gift-cert',
        '.about_us p',
        '.about_show h2',
        '.show_slider',
        '.bar p',
        '.menu_block',
        '.events-info .image-frame',
        '.events_block',
        '.contacts_info',
        '.contacts_map'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    
    elements.forEach(el => {
        el.classList.add('fade-in-scroll');
    });

    const observer = new IntersectionObserver((entries, obs) => {
        let delayCounter = 0;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If it's an event item, stagger them
                if (entry.target.classList.contains('event-item')) {
                    entry.target.style.transitionDelay = `${delayCounter * 0.15}s`;
                    delayCounter++;
                }
                
                // Need a small timeout to allow transitionDelay to apply before adding is-visible
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, 10);
                obs.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    elements.forEach(el => observer.observe(el));
});
