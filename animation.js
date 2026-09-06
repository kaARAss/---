(() => {
  const MIN_WIDTH = 1024;

  const html = document.documentElement;
  const overlay = document.getElementById('intro');
  const white   = overlay?.querySelector('.intro__white');
  const gray    = overlay?.querySelector('.intro__bg');
  const star    = overlay?.querySelector('.intro__star');

  const container = document.querySelector('.banner_image');
  const anchor = document.getElementById('star-anchor');
  const header = document.querySelector('header');
  const banner = document.querySelector('.banner');

  if (!overlay || !white || !gray || !star) {
      if (overlay) overlay.remove();
      html.classList.remove('intro-lock');
      return;
    }
  if (MIN_WIDTH && window.innerWidth < MIN_WIDTH) {
      if (overlay) overlay.remove();
      html.classList.remove('intro-lock');
      return;
    }


  function getBackgroundImageUrl(el){
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === 'none') return null;
    const m = bg.match(/url\((['"]?)(.*?)\1\)/);
    return m ? m[2] : null;
  }

  let BG_IW = null, BG_IH = null;

  async function ensureBgIntrinsicSize(){
    if (!container) return;
    if (BG_IW && BG_IH) return;

    const url = getBackgroundImageUrl(container);
    if (!url) return;

    await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { BG_IW = img.naturalWidth; BG_IH = img.naturalHeight; resolve(); };
      img.onerror = () => resolve();
      img.src = url;
    });
  }

  function coverSize(cw, ch, iw, ih){
    const scale = Math.max(cw/iw, ch/ih);
    return { w: iw * scale, h: ih * scale, scale };
  }

  function parsePos(value, overflow){
    value = String(value).trim().toLowerCase();
    if (value.endsWith('%')) {
      const p = parseFloat(value);
      return isFinite(p) ? (p/100) : 0.5;
    }
    if (value.endsWith('px')) {
      const px = parseFloat(value);
      return (overflow > 0 && isFinite(px)) ? Math.min(Math.max(px/overflow, 0), 1) : 0.5;
    }
    if (value === 'left' || value === 'top') return 0;
    if (value === 'right' || value === 'bottom') return 1;
    return 0.5;
  }


  async function placeAnchor(){
    if (!container || !anchor) return;

    const cs = getComputedStyle(container);
    if (cs.position === 'static') container.style.position = 'relative';

    const cw = container.clientWidth;
    const ch = container.clientHeight;

    await ensureBgIntrinsicSize();
    const iw = BG_IW || (+anchor.dataset.imgWidth || 1600);
    const ih = BG_IH || (+anchor.dataset.imgHeight || 770);

    const px = +anchor.dataset.pointX;
    const py = +anchor.dataset.pointY;
    if (!isFinite(px) || !isFinite(py)) return;

    const { w: drawW, h: drawH } = coverSize(cw, ch, iw, ih);

    const gp = getComputedStyle(container);
    const overflowX = Math.max(drawW - cw, 0);
    const overflowY = Math.max(drawH - ch, 0);
    const posX = parsePos(gp.backgroundPositionX, overflowX);
    const posY = parsePos(gp.backgroundPositionY, overflowY);

    const viewX = posX * overflowX;
    const viewY = posY * overflowY;

    const xScaled = px * (drawW / iw);
    const yScaled = py * (drawH / ih);

    const xInContainer = xScaled - viewX;
    const yInContainer = yScaled - viewY;

    anchor.style.left = `${xInContainer}px`;
    anchor.style.top  = `${yInContainer}px`;
  }

  function anchorCenterInContainer() {
    if (!container || !anchor) return { x: 0, y: 0 };
    const ar = anchor.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    return {
      x: (ar.left - cr.left) + ar.width / 2,
      y: (ar.top  - cr.top)  + ar.height / 2
    };
  }

  function syncStarToAnchor() {
    const c = anchorCenterInContainer();
    star.style.left = c.x + 'px';
    star.style.top  = c.y + 'px';
  }

  function moveStarIntoContainer() {
    if (!container || !star) return;
    if (star.parentElement !== container) {
      star.remove();
      container.appendChild(star);
      star.style.position = 'absolute';
      star.style.transformOrigin = '50% 50%';
      star.style.transform = 'translate(-50%,-50%) scale(0.05) rotate(-120deg)';
      syncStarToAnchor();
    }
  }

  placeAnchor();

  addEventListener('resize', () => {
    requestAnimationFrame(() => {
      placeAnchor();
      if (star?.parentElement === container) syncStarToAnchor();
    });
  }, { passive:true });

  function centers(){
    const v = { x: innerWidth/2, y: innerHeight/2 };
    const r = anchor?.getBoundingClientRect();
    const t = r ? { x: r.left + r.width/2, y: r.top + r.height/2 } : v;
    return { start: v, target: t };
  }

  overlay.hidden = false;
  html.classList.add('intro-lock');

  const whiteCollapse = white.animate([
    { clipPath:'circle(150% at 50% 50%)', WebkitClipPath:'circle(150% at 50% 50%)' },
    { clipPath:'circle(0% at 50% 50%)',   WebkitClipPath:'circle(0% at 50% 50%)' }
  ], { duration: 600, easing:'cubic-bezier(.2,.7,.1,1)', fill:'forwards' });

  const starAppear = () => star.animate([
    { opacity:0, transform:'translate(-50%,-50%) scale(0.2) rotate(0deg)' },
    { opacity:1, transform:'translate(-50%,-50%) scale(0.8) rotate(0deg)' }
  ], { duration: 250, easing:'ease-out', fill:'forwards' });

  const starGrow100 = () => star.animate([
    { transform:'translate(-50%,-50%) scale(1.0) rotate(0deg)' },
    { transform:'translate(-50%,-50%) scale(1.5) rotate(-45deg)' }
  ], { duration: 250, easing:'cubic-bezier(.1,.9,1,1)', fill:'forwards' });

  const starFlyToAnchor = () => {
    const { start, target } = centers();
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    return star.animate([
      { transform:`translate(calc(-50% + 0px), calc(-50% + 0px)) scale(1.5) rotate(-45deg)` },
      { transform:`translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.05) rotate(-120deg)` }
    ], { duration: 500, easing:'cubic-bezier(.5,.5,1,1)', fill:'forwards' });
  };

  (async () => {
    try {
      
    try { if (star.decode) await star.decode(); } catch(e) {}
    await whiteCollapse.finished;
    await starAppear().finished;
    await starGrow100().finished;
    await starFlyToAnchor().finished;

    moveStarIntoContainer();

    if (header) header.style.transform = 'translateY(-50%)';
    html.classList.remove('intro-lock');
    overlay.style.pointerEvents = 'none';

    const fadeGray = gray.animate([{opacity:1},{opacity:0}], {
      duration: 300, easing:'cubic-bezier(.5,.5,1,1)', fill:'forwards'
    });

    const headerDrop = header?.animate?.(
      [{ transform: 'translateY(-30%)' }, { transform: 'translateY(0%)' }],
      { duration: 400, easing: 'cubic-bezier(.3,.3,1,1)', fill: 'forwards' }
    );
    headerDrop?.finished.then(() => { if (header) header.style.transform = ''; });

    const bannerDrop = banner?.animate?.(
      [{ transform: 'translateY(2%)' }, { transform: 'translateY(0%)' }],
      { duration: 400, easing: 'cubic-bezier(.3,.3,1,1)', fill: 'forwards' }
    );
    bannerDrop?.finished.then(() => { if (banner) banner.style.transform = ''; });

    const burst = star.animate([
      { transform: 'translate(-50%,-50%) scale(0.05) rotate(-120deg)' },
      { transform: 'translate(-50%,-50%) scale(2.25) rotate(0deg)' }
    ], { duration: 300, easing:'cubic-bezier(.5,.5,1,1)', fill:'forwards' });

    await Promise.all([
      fadeGray.finished,
      burst.finished,
      bannerDrop?.finished ?? Promise.resolve(),
      headerDrop?.finished ?? Promise.resolve()
    ]);

    await new Promise(r => setTimeout(r, 300));
    await star.animate([{opacity:1},{opacity:0}], { duration: 300, fill:'forwards' }).finished;
    await overlay.animate([{opacity:1},{opacity:0}], { duration: 200, fill:'forwards' }).finished;
    overlay.remove();
  
    } catch(e) {
      console.error(e);
    } finally {
      if (overlay && overlay.parentNode) overlay.remove();
      html.classList.remove('intro-lock');
    }
  })();
})();