  let swiperInstance = null;
  let aboutSwiper = null;
  let newsSwiper = null;
  let teamSwiper = null;
  let teamMode = null; 

  function initMobileSlider() {
    const isMobile = window.innerWidth <= 480;
    const slider = document.querySelector('.show_slider');
    const slides = document.querySelectorAll('.show_block');
    if (!slides) return;
    if (!slides || !slider) return;

    if (isMobile && !swiperInstance) {
      slider.classList.add('swiper');
      const wrapper = document.createElement('div');
      wrapper.classList.add('swiper-wrapper');

      slides.forEach(slide => {
        slide.classList.add('swiper-slide');
        wrapper.appendChild(slide);
      });

      slider.appendChild(wrapper);

      swiperInstance = new Swiper(".show_slider", {
        slidesPerView: 1,
        spaceBetween: 16,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        watchSlidesProgress: true,
        centeredSlides: false,
        loop: false,
      });

    } else if (!isMobile && swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;

      const wrapper = slider.querySelector('.swiper-wrapper');
      if (wrapper) {
        while (wrapper.firstChild) {
          const child = wrapper.firstChild;
          child.classList.remove('swiper-slide');
          slider.appendChild(child);
        }
        wrapper.remove();
      }

      slider.classList.remove('swiper');
    }
  }

  window.addEventListener("load", initMobileSlider);
  window.addEventListener("resize", initMobileSlider);


  function initMobileSliderAbout() {
    const isMobile = window.innerWidth <= 600;
    const block = document.querySelector('.wait_block');
    if (!block) return;
    
    const items = block.querySelectorAll('.wait_item:not(.title_item)');
    const pagination = block.querySelector('.swiper-pagination');

    if (!block || !pagination) return;

    if (isMobile && !aboutSwiper) {
      block.classList.add('swiper');

      const wrapper = document.createElement('div');
      wrapper.classList.add('swiper-wrapper');

      items.forEach(item => {
        item.classList.add('swiper-slide');
        wrapper.appendChild(item);
      });

      block.insertBefore(wrapper, pagination);

      aboutSwiper = new Swiper(block, {
        slidesPerView: 1,
        spaceBetween: 16,
        pagination: {
          el: pagination,
          clickable: true
        }
      });

    } else if (!isMobile && aboutSwiper) {
      aboutSwiper.destroy(true, true);
      aboutSwiper = null;

      block.classList.remove('swiper');

      const wrapper = block.querySelector('.swiper-wrapper');
      if (wrapper) {
        const slides = Array.from(wrapper.children);
        slides.forEach(slide => {
          slide.classList.remove('swiper-slide');
          block.insertBefore(slide, pagination);
        });
        wrapper.remove();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileSliderAbout();
    window.addEventListener('resize', initMobileSliderAbout);
  });



  function initMobileSliderNews() {
    const isMobile = window.innerWidth <= 800;
    const block = document.querySelector('.all-news_page');
    if (!block) return;
    
    const items = block.querySelectorAll('.all-news_block');
    const pagination = block.querySelector('.swiper-pagination');

    if (!block || !pagination) return;

    if (isMobile && !aboutSwiper) {
      block.classList.add('swiper');

      const wrapper = document.createElement('div');
      wrapper.classList.add('swiper-wrapper');

      items.forEach(item => {
        item.classList.add('swiper-slide');
        wrapper.appendChild(item);
      });

      block.insertBefore(wrapper, pagination);

      aboutSwiper = new Swiper(block, {
        slidesPerView: 1,
        spaceBetween: 16,
        pagination: {
          el: pagination,
          clickable: true
        }
      });

    } else if (!isMobile && aboutSwiper) {
      aboutSwiper.destroy(true, true);
      aboutSwiper = null;

      block.classList.remove('swiper');

      const wrapper = block.querySelector('.swiper-wrapper');
      if (wrapper) {
        const slides = Array.from(wrapper.children);
        slides.forEach(slide => {
          slide.classList.remove('swiper-slide');
          block.insertBefore(slide, pagination);
        });
        wrapper.remove();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileSliderNews();
    window.addEventListener('resize', initMobileSliderNews);
  });


 
function initTeamSlider() {
  const block = document.querySelector('.team_section_page .team_items');
  if (!block) return;

  const container = block.closest('.team_block');
  const prevBtn = container.querySelector('.team_nav_prev');
  const nextBtn = container.querySelector('.team_nav_next');

  let wrapper = block.querySelector('.swiper-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'swiper-wrapper';
    block.classList.add('swiper');

    [...block.querySelectorAll('.team_item_link')].forEach(el => {
      el.classList.add('swiper-slide');
      wrapper.appendChild(el);
    });

    let paginationEl = block.querySelector('.swiper-pagination');
    if (!paginationEl) {
      paginationEl = document.createElement('div');
      paginationEl.className = 'swiper-pagination';
      block.appendChild(paginationEl);
    }

    block.insertBefore(wrapper, paginationEl);
  }

  const paginationEl = block.querySelector('.swiper-pagination');

  if (!teamSwiper) {
    teamSwiper = new Swiper(block, {
      watchOverflow: true,
      spaceBetween: 30,
      slidesPerView: 4,
      navigation: { nextEl: nextBtn, prevEl: prevBtn, enabled: true },
      pagination: { el: paginationEl, clickable: true, enabled: false },

      breakpoints: {
        0: {
          slidesPerView: 2,
          spaceBetween: 16,
          navigation: { enabled: false },
          pagination: { enabled: true }
        },
        768: { 
          slidesPerView: 3,
          spaceBetween: 16,
          navigation: { enabled: false },
          pagination: { enabled: true }
        },
        900: { 
          slidesPerView: 4,
          spaceBetween: 30,
          navigation: { enabled: true },
          pagination: { enabled: false }
        }
      }
    });
  } else {
    teamSwiper.update();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTeamSlider();
  window.addEventListener('resize', () => teamSwiper && teamSwiper.update());
});