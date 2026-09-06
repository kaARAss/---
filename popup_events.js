document.addEventListener('DOMContentLoaded', function () {
    const defaultOverlay = document.querySelector('.event_tickets_overlay');
    const defaultPopup   = document.querySelector('.event_tickets');
    const defaultSuccess = document.querySelector('.event_tickets_success');
    const defaultManagement = document.querySelector('.management-tickets');

    const openers = document.querySelectorAll('.event-item_button');

    const CLOSE_ON_BACKDROP_CLICK = false;

    let scrollYTickets = 0;

    function lockBody() {
        scrollYTickets = window.scrollY || window.pageYOffset || 0;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollYTickets}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflowY = 'hidden';
        document.body.style.width = '100%';
    }

    function unlockBody() {
        const y = Math.abs(parseInt(document.body.style.top || '0')) || 0;

        const html = document.documentElement;
        const prevScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflowY = '';
        document.body.style.width = '';

        requestAnimationFrame(() => {
            window.scrollTo(0, y);
            setTimeout(() => {
            html.style.scrollBehavior = prevScrollBehavior;
            }, 0);
        });
    }

    function ensureOpen(overlayEl) {
        if (!overlayEl.classList.contains('active')) {
        lockBody();
        overlayEl.classList.add('active');
        }
    }

    function openTicketsPopup(popupEl, overlayEl) {
        if (!overlayEl || !popupEl) return;
        ensureOpen(overlayEl);
        popupEl.classList.add('active');
    }

    function openSuccessPopup(successEl, popupEl, overlayEl) {
        if (!overlayEl || !successEl) return;
        ensureOpen(overlayEl);
        popupEl?.classList.remove('active');
        successEl.classList.add('active');
    }

    function openManagement(managementEl, popupEl, overlayEl) {
        if (!overlayEl || !managementEl) return;
        ensureOpen(overlayEl);
        popupEl?.classList.remove('active');
        managementEl.classList.add('active');
    }

    function closeAllTickets(overlayEl) {
        if (!overlayEl) return;
        overlayEl.classList.remove('active');
        overlayEl.querySelectorAll('.event_tickets, .management-tickets, .event_tickets_success, .management-tickets-checkout')
        .forEach(el => el.classList.remove('active'));
        unlockBody();
    }

    function resolveElementsFrom(btn) {
        const overlaySel    = btn?.dataset.overlay    || '.event_tickets_overlay';
        const targetSel     = btn?.dataset.target     || '.event_tickets';
        const successSel    = btn?.dataset.success    || '.event_tickets_success';
        const managementSel = btn?.dataset.management || '.management-tickets';

        const overlayEl = document.querySelector(overlaySel) || defaultOverlay;
        const popupEl   = document.querySelector(targetSel)  || defaultPopup;
        const successEl = document.querySelector(successSel) || defaultSuccess;

        let managementEl = null;
        if (overlayEl) {
          managementEl = overlayEl.querySelector(managementSel) || overlayEl.querySelector('.management-tickets');
        }
        if (!managementEl) {
          managementEl = document.querySelector(managementSel) || defaultManagement || null;
        }

        return { overlayEl, popupEl, successEl, managementEl };
    }

    openers.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const { overlayEl, popupEl } = resolveElementsFrom(btn);
          openTicketsPopup(popupEl, overlayEl);
        });
    });

    document.addEventListener('click', (e) => {
        const opener = e.target.closest('.event-item_button');
        if (opener) {
        e.preventDefault();
        const { overlayEl, popupEl } = resolveElementsFrom(opener);
        openTicketsPopup(popupEl, overlayEl);
        }
    });

    document.addEventListener('click', (e) => {
        const submit = e.target.closest('.event_tickets_submit');
        if (submit) {
          e.preventDefault();
          const { overlayEl, popupEl, successEl } = resolveElementsFrom(submit);
          if (successEl) openSuccessPopup(successEl, popupEl, overlayEl);
        }
    });

    document.addEventListener('click', (e) => {
        const item = e.target.closest('.event_list-item');
        if (item) {
          e.preventDefault();
          const { overlayEl, popupEl, managementEl } = resolveElementsFrom(item);
          if (managementEl) {
            openManagement(managementEl, popupEl, overlayEl);
          }
        }
    });

    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('.close_event_tickets');
        if (closeBtn) {
            e.preventDefault();
            const { overlayEl } = resolveElementsFrom(closeBtn);
            closeAllTickets(overlayEl);
        }
    });

    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('.close_management-tickets');
        if (closeBtn) {
            e.preventDefault();
            const { overlayEl } = resolveElementsFrom(closeBtn);
            document.body.classList.remove('no-scroll');
            closeAllTickets(overlayEl);       
            // $('#submit-code').value = 'Применить';
        }
    });

    document.addEventListener('click', (e) => {
        const overlayEl = e.target.closest('.event_tickets_overlay');
        if (!overlayEl) return;
        if (CLOSE_ON_BACKDROP_CLICK && e.target === overlayEl) {
        closeAllTickets(overlayEl);
        }
    });

    // document.addEventListener('click', (e) => {
    //     const backBtn = e.target.closest('#order-tickets_step');
    //     if (!backBtn) return;

    //     e.preventDefault();

    //     const overlay = document.querySelector('.event_tickets_overlay');
    //     const management = overlay?.querySelector('.management-tickets');
    //     const tickets = overlay?.querySelector('.event_tickets');

    //     if (overlay && management && tickets) {
    //         management.classList.remove('active');
    //         tickets.classList.add('active');
    //     }
    // });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.event_tickets_overlay.active').forEach(ov => {
            closeAllTickets(ov);
          });
        }
    });
});

document.addEventListener('click', (e) => {
    const nextBtn = e.target.closest('#order-next_step');
    if (!nextBtn) return; 

    if (!nextBtn.classList.contains('active')) {
        return;
    }

    e.preventDefault();

    const overlay = document.querySelector('.event_tickets_overlay');
    const management = overlay?.querySelector('.management-tickets');
    const checkout  = overlay?.querySelector('.management-tickets-checkout');

    if (overlay && management && checkout) {
        management.classList.remove('active');
        checkout.classList.add('active');
    }
});

document.addEventListener('click', (e) => {
    const prevBtn = e.target.closest('#order-prev_step');
    if (!prevBtn) return;;

    e.preventDefault();

    const overlay = prevBtn.closest('.event_tickets_overlay')
                  || document.querySelector('.event_tickets_overlay.active')
                  || document.querySelector('.event_tickets_overlay');

    if (!overlay) return;

    const management = overlay.querySelector('.management-tickets');
    const checkout  = overlay.querySelector('.management-tickets-checkout');

    if (!management || !checkout) return;

    checkout.classList.remove('active');
    management.classList.add('active');
});


document.addEventListener('DOMContentLoaded', function () {
    const agreeCheckbox = document.getElementById('confirm_agree');
    const submitBtn = document.getElementById('submit-order');

    if (agreeCheckbox && submitBtn) {
        submitBtn.classList.toggle('disabled', !agreeCheckbox.checked);

        agreeCheckbox.addEventListener('change', function () {
            submitBtn.classList.toggle('disabled', !agreeCheckbox.checked);
        });
    }
});


