/* Smooth discrete mouse-wheel steps; keep touch and precise trackpad gestures native. */
(function () {
    'use strict';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 961px) and (hover: hover) and (pointer: fine)');
    let frame = 0, target = 0, position = 0, previous = 0;
    function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    function locked() {
        return document.body.classList.contains('order-modal-open') || document.body.classList.contains('modal-open') ||
            getComputedStyle(document.body).position === 'fixed' || getComputedStyle(document.documentElement).overflowY === 'hidden';
    }
    function tick(now) {
        if (reduced.matches || !desktop.matches || locked()) { stop(); return; }
        const dt = previous ? Math.min(now - previous, 50) : 16;
        previous = now;
        const limit = Math.max(0, document.documentElement.scrollHeight - innerHeight);
        target = Math.max(0, Math.min(target, limit));
        position += (target - position) * (1 - Math.exp(-dt / 85));
        if (Math.abs(target - position) < 0.75) {
            window.scrollTo({top: target, behavior: 'instant'}); stop(); return;
        }
        window.scrollTo({top: position, behavior: 'instant'});
        frame = requestAnimationFrame(tick);
    }
    window.addEventListener('wheel', event => {
        if (event.defaultPrevented || !event.cancelable || reduced.matches || !desktop.matches || locked() ||
            event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.deltaX ||
            !event.deltaY || (event.deltaMode === 0 && (Math.abs(event.deltaY) < 40 || !Number.isInteger(event.deltaY)))) { stop(); return; }
        for (let node = event.target instanceof Element ? event.target : null; node && node !== document.body; node = node.parentElement) {
            if (node.matches('input, textarea, select, [contenteditable="true"]') ||
                (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight)) { stop(); return; }
        }
        const delta = event.deltaY * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? innerHeight : 1);
        if (!frame) { position = scrollY; target = position; }
        const next = Math.max(0, Math.min(target + delta, document.documentElement.scrollHeight - innerHeight));
        if (next === target && !frame) return;
        event.preventDefault();
        target = next;
        if (!frame) frame = requestAnimationFrame(tick);
    }, {passive: false});
    ['pointerdown', 'touchstart', 'keydown'].forEach(type => window.addEventListener(type, stop, {passive: true}));
    reduced.addEventListener('change', stop);
    desktop.addEventListener('change', stop);
    window.addEventListener('blur', stop);
})();
