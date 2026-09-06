(() => {
  const VERSION = 'notice_v1:';

  const now = () => Date.now();
  const daysToMs = d => d * 864e5;

  function isDismissed(id) {
    const raw = localStorage.getItem(VERSION + id);
    if (!raw) return false;
    try {
      const { until } = JSON.parse(raw);
      return until === null || now() < until;
    } catch {
      return true;
    }
  }

  function dismiss(id, days) {
    const until = Number.isFinite(days) ? now() + daysToMs(days) : null;
    localStorage.setItem(VERSION + id, JSON.stringify({ until }));
  }

  document.querySelectorAll('.popup[data-popup-id]').forEach(el => {
    const id = el.dataset.popupId;
    const expireDays = parseInt(el.dataset.expireDays, 10);

    if (isDismissed(id)) {
      el.classList.add('is-hidden');
      return;
    }

    el.querySelectorAll('.js-popup-ok').forEach(btn => {
      btn.addEventListener('click', () => {
        dismiss(id, isNaN(expireDays) ? null : expireDays);
        el.classList.add('is-hidden');
      });
    });
  });
})();