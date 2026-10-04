// Slider About initialization
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Swiper !== 'undefined' && document.querySelector('.show_slider')) {
        try {
            new Swiper('.show_slider', {
                slidesPerView: 1,
                spaceBetween: 20,
                loop: false,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    768: {
                        slidesPerView: 'auto',
                        spaceBetween: 30
                    }
                }
            });
        } catch(e) {}
    }
});
