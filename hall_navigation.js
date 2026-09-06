(()=>{
  const canvas = document.getElementById('hallCanvas');
  const frame  = canvas.querySelector('.hall-frame-stage');
  const isMobile = window.innerWidth < 768;
    const ANCHOR = {
      x: -120,
      y: -150
    };

    if (window.innerWidth < 470) {
      ANCHOR.x = -100;
    }

    function getLimits() {
      const vp = canvas.getBoundingClientRect();
      const fr = frame.getBoundingClientRect();
      
      const FLEX = window.innerWidth < 768 ? 1.95 : 1.35;
    
      const extraX = (fr.width  - vp.width)  / 2;
      const extraY = (fr.height - vp.height) / 2;
    
      const pad = window.innerWidth < 768 ? 60 : 20;
    
    return {
      left:   (extraX + pad) * FLEX,
      right:  (extraX + pad) * FLEX,
      top:    (extraY + pad) * FLEX,
      bottom: (extraY + pad) * FLEX
    };
    }

  let scale = 0.6, min=0.6, max=1.7;
  let pos = {x:0, y:0}, start, dragging=false;
  
  let pinchStartDist = 0;
  let pinchStartScale = scale;
  let isPinching = false;
  
  function getTouchDist(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  }

  if (window.innerWidth < 470) {
      min = 0.45;
      max = 1.45;
      scale = 0.45;

      pos.x = 0;
      ANCHOR.y -= 50;
  }
  
  if (window.innerHeight < 690) {
      min = 0.42;
      scale = 0.42;

      pos.x = 0;
  }

  const apply = ()=> {
  frame.style.transform =
    `translate(calc(-50% + ${ANCHOR.x + pos.x}px),
               calc(-50% + ${ANCHOR.y + pos.y}px))
     scale(${scale})`;
    updateCursor();
    updateZoomButtons();
  };

    function isOutOfBounds() {
        const L = getLimits();
        return (
            pos.x < -L.left  ||
            pos.x >  L.right ||
            pos.y < -L.top   ||
            pos.y >  L.bottom
        );
    }
    function springBack() {
      const L = getLimits();
    
      const tx = Math.min(L.right, Math.max(-L.left, pos.x));
      const ty = Math.min(L.bottom, Math.max(-L.top, pos.y));
    
      if (tx === pos.x && ty === pos.y) return;
    
      frame.style.transition = "transform 0.25s ease-out";
      pos.x = tx;
      pos.y = ty;
      apply();
    
      setTimeout(() => {
        frame.style.transition = "";
      }, 260);
    }

  function autoZoomToSeat(seat) {
      const prev = scale;
      const target = clamp(min * 1.6, min, max);

      if (target <= prev + 0.01) return;

      const frameRect = frame.getBoundingClientRect();
      const seatRect  = seat.getBoundingClientRect();

      const sx = seatRect.left + seatRect.width / 2;
      const sy = seatRect.top  + seatRect.height / 2;

      const cx = sx - frameRect.left - frameRect.width  / 2;
      const cy = sy - frameRect.top  - frameRect.height / 2;

      scale = target;
      const k = scale / prev;

      pos.x -= cx * (k - 1);
      pos.y -= cy * (k - 1);

      pos.y -= 40;

      frame.style.transition = "transform 0.25s ease-out";
      apply();
      setTimeout(() => { frame.style.transition = ""; }, 260);
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    apply();
  });
  const clamp = (v,min,max)=> Math.min(max, Math.max(min,v));

  function updateCursor() {
    if (isMobile) return;
    if (scale === min) {
        canvas.style.cursor = 'default';
    } else {
        canvas.style.cursor = 'grab';
    }
  }

  canvas.addEventListener('mousedown', e=>{
    if (e.target.closest('button.seat')) return;
    if (!isMobile && scale === min) return;

    dragging=true; 
    canvas.classList.add('dragging');
    start = {x:e.clientX - pos.x, y:e.clientY - pos.y};
    hideTooltip();
  });
  window.addEventListener('mousemove', e=>{
    if(!dragging) return;
    pos.x = e.clientX - start.x;
    pos.y = e.clientY - start.y;

    apply();
  });
  window.addEventListener('mouseup', ()=>{ 
    if(!dragging) return;  
    dragging=false; 
    canvas.classList.remove('dragging'); 
    springBack();
  });
  
  let mode = 'idle';

    canvas.addEventListener('touchend', ()=>{
        dragging=false;
        springBack();
    });

    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        mode = 'drag';
    
        start = {
          x: e.touches[0].clientX - pos.x,
          y: e.touches[0].clientY - pos.y
        };
      }
    
      if (e.touches.length === 2) {
        e.preventDefault();
    
        mode = 'pinch';
    
        pinchStartDist  = getTouchDist(e.touches[0], e.touches[1]);
        pinchStartScale = scale;
      }
    }, { passive:false });
    
    canvas.addEventListener('touchmove', e => {
    
      if (mode === 'drag' && e.touches.length === 1) {
        e.preventDefault();
    
        pos.x = e.touches[0].clientX - start.x;
        pos.y = e.touches[0].clientY - start.y;
    
        apply();
      }
    
      if (mode === 'pinch' && e.touches.length === 2) {
        e.preventDefault();
    
        const dist = getTouchDist(e.touches[0], e.touches[1]);
        const zoom = dist / pinchStartDist;
    
        scale = clamp(pinchStartScale * zoom, min, max);
        apply();
      }
    
    }, { passive:false });
  
    canvas.addEventListener('touchend', e => {
    
      if (mode === 'pinch' && e.touches.length === 1) {
        // из pinch → drag
        mode = 'drag';
    
        start = {
          x: e.touches[0].clientX - pos.x,
          y: e.touches[0].clientY - pos.y
        };
        return;
      }
    
      if (e.touches.length === 0) {
        mode = 'idle';
        springBack();
      }
    });

  canvas.addEventListener('wheel', e=>{
    e.preventDefault();
    hideTooltip();

    const delta = -Math.sign(e.deltaY)*0.12;
    const prev = scale;
    scale = clamp(scale + delta, min, max);

    if (scale === min && prev !== min) {
      resetPosition();
    } else {
      const rect = frame.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width/2;
      const cy = e.clientY - rect.top  - rect.height/2;
      pos.x -= cx*(scale/prev - 1);
      pos.y -= cy*(scale/prev - 1);
    }

    apply();
  }, {passive:false});

  document.querySelectorAll('.zoom-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      hideTooltip();
      const dir = btn.dataset.zoom==='in' ? 1 : -1;
      const prev = scale;
      scale = clamp(scale + dir*0.15, min,max);

      if (scale === min && prev !== min) {
          resetPosition();
      }

      apply();
    });
  });


const containers = document.querySelectorAll('#hallCanvas .circle-container');

function centerFromFacing(facing='down'){
  switch(String(facing).toLowerCase()){
    case 'down':  return 90;
    case 'up':    return 270;
    case 'left':  return 105;
    case 'right': return 75;
    default:      return 90;
  }
}

containers.forEach(cont=>{
  const seats = [...cont.querySelectorAll('.seat')];
  if (!seats.length) return;

  const arc     = Number(cont.dataset.arc ?? 120);
  const facing  = cont.dataset.facing || 'down';
  const center  = Number.isFinite(+cont.dataset.center) ? +cont.dataset.center : centerFromFacing(facing);
  const radius  = Number(cont.dataset.radius ?? 56);

  const isEllipse = cont.classList.contains('six-seats-table');

  const rx = Number(cont.dataset.rx || radius); 
  const ry = Number(cont.dataset.ry || (isEllipse ? Math.round(radius*0.82) : radius));
  const offsets = isEllipse
    ? (cont.dataset.offsets || '-64,-36,-12,12,36,64').split(',').map(v=>Number(v.trim()))
    : null;
  const pushes = isEllipse
    ? (cont.dataset.pushes || '8,4,0,0,4,8').split(',').map(v=>Number(v.trim()))
    : null;

  const startDeg = (cont.dataset.start !== undefined && cont.dataset.start !== '')
      ? Number(cont.dataset.start)
      : (center - arc/2);

  const cx = cont.clientWidth/2, cy = cont.clientHeight/2;
  const n  = seats.length;
  const step = n>1 ? arc/(n-1) : 0;

  const pos = Array.from({length:n}, (_,i)=>{
    let angDeg;
    if (isEllipse) {
      angDeg = center + (offsets?.[i] ?? (-arc/2 + step*i));
    } else {
      angDeg = startDeg + step*i;
    }
    const t = angDeg * Math.PI/180;

    let x = cx + (isEllipse ? rx*Math.cos(t) : radius*Math.cos(t));
    let y = cy + (isEllipse ? ry*Math.sin(t) : radius*Math.sin(t));

    let rotateDeg = angDeg - 90;
    if (isEllipse) {
      const nx = Math.cos(t) / rx;
      const ny = Math.sin(t) / ry;
      const len = Math.hypot(nx, ny) || 1;
      const ux = nx/len, uy = ny/len;  
      const push = pushes?.[i] ?? 0;  
      x += ux * push;
      y += uy * push;

      rotateDeg = Math.atan2(ny, nx) * 180/Math.PI - 90;
    }

    return { x, y, rotateDeg };
  });

  const orderLTR = pos.map((p,idx)=>({idx, x:p.x}))
                      .sort((a,b)=>a.x - b.x)
                      .map(o=>o.idx);
  const rtl = (cont.dataset.order || '').toLowerCase() === 'rtl';
  const applyOrder = rtl ? [...orderLTR].reverse() : orderLTR;

  applyOrder.forEach((srcIdx, dstIdx)=>{
    const p = pos[srcIdx];
    const seat = seats[dstIdx];

    const dx = Number(seat.dataset.dx || 0);
    const dy = Number(seat.dataset.dy || 0);
    const rot = (seat.dataset.rot !== undefined && seat.dataset.rot !== '')
                  ? Number(seat.dataset.rot)
                  : p.rotateDeg;

    seat.style.left = (p.x - 17 + dx) + 'px';
    seat.style.top  = (p.y - 17 + dy) + 'px';
    seat.style.transform = `rotate(${rot}deg)`;
    seat.style.setProperty('--seat-rot', `${p.rotateDeg}deg`);
  });
});

function updateZoomButtons() {
    const btnIn  = document.querySelector('.zoom-btn[data-zoom="in"]');
    const btnOut = document.querySelector('.zoom-btn[data-zoom="out"]');

    if (scale <= min) {
        btnOut.disabled = true;
        btnOut.style.opacity = '0.5';
        btnOut.style.cursor = 'default';
    } else {
        btnOut.disabled = false;
        btnOut.style.opacity = '1';
        btnOut.style.cursor = 'pointer';
    }

    if (scale >= max) {
        btnIn.disabled = true;
        btnIn.style.opacity = '0.5';
        btnIn.style.cursor = 'default';
    } else {
        btnIn.disabled = false;
        btnIn.style.opacity = '1';
        btnIn.style.cursor = 'pointer';
    }
}
    function resetPosition() {
      frame.style.transition = "transform 0.25s ease-out";
      pos.x = 0;
      pos.y = 0;
  
    // if (window.innerWidth < 470) {
    //   pos.x = -100;
    // }

      setTimeout(() => {
        frame.style.transition = "";
      }, 260);
    }



  const tooltip = document.getElementById('seatTooltip');
  const priceEl = tooltip.querySelector('.seat-tooltip__price');
  const metaEl  = tooltip.querySelector('.seat-tooltip__meta');
  const viewport= document.querySelector('.hall-viewport');

  // const PRICES = (() => {
  //   const map = {};
  //   document.querySelectorAll('.ticket-categories-price label').forEach(label => {
  //     const cat = label.querySelector('.category_circle')?.dataset.category;
  //     const priceText = label.querySelector('span')?.textContent?.trim();
  //     if (cat && priceText) map[cat] = priceText;
  //   });
  //   return map;
  // })();

  // function getPriceByCategory(cat) {
  //   return PRICES[cat] ?? '';
  // }

  function getPriceByCategory(cat) {

      if (window.ticketPrices && window.ticketPrices[cat] !== undefined) {
          const num = Number(window.ticketPrices[cat]);
          if (!isNaN(num)) {
              return num.toLocaleString('ru-RU') + ' ₽';
          }
      }

      const label = document.querySelector(
          `.ticket-categories-price .category_circle[data-category="${cat}"]`
      )?.parentElement;
      
      if (label) {
          const span = label.querySelector('span');
          if (span) return span.textContent.trim();
      }

      return '';
  }

    function placeTooltipAtSeat(seat){
        const vp = viewport.getBoundingClientRect();
        const r  = seat.getBoundingClientRect();

        const tw = tooltip.offsetWidth  || 220;
        const th = tooltip.offsetHeight || 60;
        const pad = 10;

        const cx = r.left + r.width/2 - vp.left;
        const topAnchor = r.top - 6 - vp.top;   
        const bottomAnchor = r.bottom + 6 - vp.top;

        let useBottom = false;
        let x = cx, y = topAnchor;

        if (y - th < pad) { useBottom = true; y = bottomAnchor; }
        if (useBottom && y + pad > vp.height) { useBottom = false; y = topAnchor; }

        x = Math.max(pad + tw/2, Math.min(vp.width - pad - tw/2, x));

        tooltip.classList.toggle('bottom', useBottom);
        tooltip.style.left = x + 'px';
        tooltip.style.top  = y + 'px';
    }
  function showTooltipForSeat(seat){
    const cat = seat.dataset.category || '1';
    priceEl.textContent = getPriceByCategory(cat);
    metaEl.textContent  = seat.dataset.seat || '';
    tooltip.hidden = false;
    placeTooltipAtSeat(seat);
  }
  function hideTooltip(){ tooltip.hidden = true; }

  let hoverSeat = null;
  canvas.addEventListener('mousemove', e=>{
    const seat = e.target.closest('.seat');
    if (seat === hoverSeat) { if (seat) placeTooltipAtSeat(seat); return; }

    if (hoverSeat) hoverSeat.classList.remove('is-hover');
    hoverSeat = seat;

    if (!seat) { hideTooltip(); return; }
    if (seat.dataset.blocked!=='1' && !seat.classList.contains('is-selected')){
      seat.classList.add('is-hover');
    }

    if (window.innerWidth >= 600) {
        showTooltipForSeat(seat);
    }
  });


canvas.addEventListener('mouseleave', ()=>{
  if(hoverSeat) hoverSeat.classList.remove('is-hover');
  hoverSeat=null; tooltip.hidden=true;
});

  canvas.addEventListener('click', e=>{
    const seat = e.target.closest('.seat');
    if(!seat || seat.dataset.blocked==='1') return;

    if (isMobile && scale <= min + 0.05) {
        autoZoomToSeat(seat);
    }

    seat.classList.toggle('is-selected');
    seat.classList.remove('is-hover');
    hideTooltip();
  });
})();
