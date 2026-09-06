(function(){
  const cache = new Map();

  function loadAndDecode({src, srcset, sizes, priority = 'auto'}) {
    if (!src) return Promise.resolve(null);
    if (cache.has(src)) return Promise.resolve(cache.get(src));
    const im = new Image();
    if (srcset) im.srcset = srcset;
    if (sizes)  im.sizes  = sizes;
    try { im.fetchPriority = priority; } catch(_) {}
    im.decoding = 'async';
    im.loading  = 'eager';
    im.src = src;

    return (im.decode ? im.decode() : Promise.resolve())
      .catch(()=>{})
      .then(()=>{ cache.set(src, im); return im; });
  }

  function prefetch(url, srcset, sizes){
    if (!url || cache.has(url)) return;
    loadAndDecode({src:url, srcset, sizes, priority:'low'});
  }

  const lazyImgs = document.querySelectorAll('.gallery_block img[data-src]');
  if (lazyImgs.length) {
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(!e.isIntersecting) return;
        const img = e.target;
        io.unobserve(img);

        const src    = img.dataset.src;
        const srcset = img.dataset.srcset;
        const sizes  = img.dataset.sizes;

        loadAndDecode({src, srcset, sizes, priority:'high'}).then(()=>{
          if (srcset) img.srcset = srcset;
          if (sizes)  img.sizes  = sizes;
          img.decoding = 'async';
          img.loading  = 'lazy';
          img.src = src;
          img.classList.add('img-ready');
        });
      });
    }, {rootMargin: '300px 0px', threshold: 0.01});

    lazyImgs.forEach(img=> io.observe(img));
  }

  const links = Array.from(document.querySelectorAll('.gallery_block a'));
  const box   = document.getElementById('lightbox');
  const big   = document.getElementById('lbImg');
  const prevB = document.getElementById('lbPrev');
  const nextB = document.getElementById('lbNext');
  const closeB= document.getElementById('lbClose');
  const stage = document.querySelector('.lb_stage');

  const hasLightbox =
    links.length > 0 && box && big && prevB && nextB && closeB && stage;

  if (!hasLightbox) return;

  let i = -1;

  big.onload = () => { requestAnimationFrame(()=> big.classList.add('ready')); };

  function currentHref(idx){ return links[idx].getAttribute('href'); }

  function setBigInstant(im){
    if (!im) return;
    big.classList.remove('ready');
    big.src = im.currentSrc || im.src;
    if (big.complete) requestAnimationFrame(()=> big.classList.add('ready'));
  }

  function show(src){
    big.style.transform = 'translateX(0)';
    big.style.transition = 'none';
    const cached = cache.get(src);
    if (cached) { setBigInstant(cached); return; }
    loadAndDecode({src, priority:'high'}).then(setBigInstant);
  }

  function preloadAround(index){
    const nextIdx = (index+1) % links.length;
    const prevIdx = (index-1+links.length) % links.length;
    prefetch(currentHref(nextIdx));
    prefetch(currentHref(prevIdx));
  }

  function open(k){
    i = k;
    const href = currentHref(i);
    show(href);
    preloadAround(i);
    box.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function close(){
    box.classList.remove('open');
    document.body.style.overflow='';
    setTimeout(()=>{ big.src=''; big.classList.remove('ready'); }, 200);
  }
  function next(){
    i = (i+1) % links.length;
    const href = currentHref(i);
    show(href);
    preloadAround(i);
  }
  function prev(){
    i = (i-1+links.length) % links.length;
    const href = currentHref(i);
    show(href);
    preloadAround(i);
  }

  links.forEach((a,idx)=> a.addEventListener('click', e=>{ e.preventDefault(); open(idx); }));
  nextB.addEventListener('click', e=>{ e.stopPropagation(); next(); });
  prevB.addEventListener('click', e=>{ e.stopPropagation(); prev(); });
  closeB.addEventListener('click', close);
  box.addEventListener('click', e=>{ if(e.target===box) close(); });
  window.addEventListener('keydown', e=>{
    if(!box.classList.contains('open')) return;
    if(e.key==='Escape') close();
    if(e.key==='ArrowRight') next();
    if(e.key==='ArrowLeft')  prev();
  });

  const isTouch = matchMedia('(pointer: coarse)').matches;
  if (isTouch) {
    const ghost = document.createElement('img');
    ghost.className = 'lb_img_next';
    ghost.alt = '';
    ghost.decoding = 'async';
    ghost.style.pointerEvents = 'none';
    stage.appendChild(ghost);

    let startX=0,startY=0,dx=0,dragging=false,decided=false,dir=0,width=0,nextSrc='';

    function prepare(direction){
      dir = direction;
      const idx = dir>0 ? (i+1)%links.length : (i-1+links.length)%links.length;
      nextSrc = currentHref(idx);
      width = stage.clientWidth;

      loadAndDecode({src: nextSrc, priority:'low'}).then(im=>{
        if (!im) return;
        ghost.src = im.currentSrc || im.src;
        ghost.style.transition='none';
        big.style.transition='none';
        ghost.style.transform=`translateX(${dir>0?width:-width}px)`;
        big.style.transform=`translateX(0)`;
      });
    }

    function follow(deltaX){
      dx = deltaX;
      big.style.transform=`translateX(${dx}px)`;
      ghost.style.transform=`translateX(${(dir>0?width:-width)+dx}px)`;
    }

    function settle(){
      big.style.transition='transform .24s ease';
      ghost.style.transition='transform .24s ease';
      if(Math.abs(dx)>width*0.20){
        big.style.transform=`translateX(${dir>0?-width:width}px)`;
        ghost.style.transform='translateX(0)';
        const done=()=>{
          big.removeEventListener('transitionend',done);
          i = dir>0 ? (i+1)%links.length : (i-1+links.length)%links.length;
          const ready = cache.get(nextSrc);
          if (ready) setBigInstant(ready); else big.src = nextSrc;
          big.style.transition='none';
          ghost.style.transition='none';
          big.style.transform='translateX(0)';
          ghost.style.transform=`translateX(${dir>0?width:-width}px)`;
          preloadAround(i);
        };
        big.addEventListener('transitionend',done);
      } else {
        big.style.transform='translateX(0)';
        ghost.style.transform=`translateX(${dir>0?width:-width}px)`;
      }
    }

    stage.addEventListener('touchstart',e=>{
      if(!box.classList.contains('open')) return;
      const t=e.touches[0];
      startX=t.clientX; startY=t.clientY; dx=0; dragging=true; decided=false;
      width=stage.clientWidth;
    },{passive:true});

    stage.addEventListener('touchmove',e=>{
      if(!dragging) return;
      const t=e.touches[0];
      const mx=t.clientX-startX, my=t.clientY-startY;
      if(!decided){
        if(Math.abs(my)>Math.abs(mx) && Math.abs(my)>10){ dragging=false; return; }
        if(Math.abs(mx)>6){ decided=true; prepare(mx<0?+1:-1); }
        else return;
      }
      follow(mx);
    },{passive:true});

    stage.addEventListener('touchend',()=>{ if(dragging){ settle(); dragging=false; } },{passive:true});
    stage.addEventListener('touchcancel',()=>{ dragging=false; },{passive:true});
  }
})();
