/* Read data without executing it. No asynchronous dependency before seats.js. */
(function () {
  'use strict';
  const block = document.getElementById('site-content');
  try {
    const data = TaisContent.validate(JSON.parse(block.textContent));
    window.siteContent = data;
    window.monthsData = data.monthsData;
    window.ticketPrices = data.ticketPrices;
    function apply() {
      const links = data.links;
      document.querySelectorAll('[data-contact]').forEach(node => {
        const key = node.dataset.contact;
        const value = links[key] || '';
        if (key === 'address') { node.textContent = value; return; }
        const href = key === 'phone' ? 'tel:' + value.replace(/[^\d+]/g, '') : key === 'email' ? 'mailto:' + value : value;
        if (href) {
          node.setAttribute('href', href);
          if (node.hasAttribute('data-url')) node.setAttribute('data-url', href);
        } else {
          node.removeAttribute('href');
          node.removeAttribute('data-url');
        }
        const label = node.querySelector('[data-contact-text]');
        if (label) label.textContent = value;
        if (node.classList.contains('order-messenger-btn')) {
          node.removeAttribute('onclick');
          const sub = node.querySelector('.order-messenger-btn-hint');
          if (sub && value) sub.textContent = key === 'telegram' ? new URL(value).pathname.replace('/', '@') : 'Быстрый чат в MAX';
        }
      });
      const banners = document.getElementById('published-banner-images') || document.createElement('style');
      banners.id = 'published-banner-images';
      banners.textContent = '@media(min-width:961px){.banner .banner_image{background-image:url("' + data.banner.desktopImage + '")!important}}' +
        '@media(max-width:960px){.banner .banner_image{background-image:url("' + data.banner.mobileImage + '")!important}}';
      document.head.appendChild(banners);
      const map = document.querySelector('.contacts_map iframe');
      if (map && links.address && links.address !== 'Самара, улица Водников, 49') {
        const url = new URL(map.src);
        url.searchParams.set('q', links.address);
        if (map.src !== url.href) map.src = url.href;
      }
      document.querySelectorAll('.event-seasons .event-item').forEach((card, i) => {
        const show = data.monthsData[i];
        if (!show) return;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Подробнее: ' + show.title);
        const image = card.querySelector('.background-image');
        const mobile = innerWidth <= 960;
        if (image) {
          image.src = mobile && show.mobileImage ? show.mobileImage : show.image;
          image.alt = show.title;
          const entry = data.showPosMap[i + 1] || 'left center';
          const pos = typeof entry === 'string' ? entry : entry.pos;
          const scale = typeof entry === 'object' ? entry.scale || 1 : 1;
          image.style.setProperty('object-position', pos, 'important');
          image.style.setProperty('transform-origin', pos, 'important');
          image.style.setProperty('transform', scale === 1 ? 'none' : 'scale(' + scale + ')', 'important');
        }
        const title = card.querySelector('h2');
        if (title) title.textContent = show.title;
        const subtitle = card.querySelector('.card-subtitle');
        if (subtitle) subtitle.textContent = show.description || '';
      });
    }
    document.addEventListener('DOMContentLoaded', apply);
    window.addEventListener('resize', apply);
    // No payment backend is configured. Never submit the dormant legacy forms
    // to nonexistent handlers or imply that payment/seat reservation succeeded.
    document.addEventListener('submit', function (event) {
      if (data.ticketPrices === null && ['order-event-form', 'order-certs-form'].includes(event.target.id)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (typeof window.openOrderMessengerModal === 'function') window.openOrderMessengerModal();
      }
    }, true);
  } catch (error) {
    console.error('Не удалось прочитать данные сайта:', error);
    window.monthsData = [];
  }
})();