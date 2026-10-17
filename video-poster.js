/* Local video-frame posters. No uploads or third-party services during extraction. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TaisVideoPoster=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function candidateTimes(duration){
  if(!Number.isFinite(duration)||duration<=0)throw new Error('Не удалось определить длительность видео');
  const end=Math.max(0.01,duration-Math.min(.08,duration*.03)),minimum=Math.min(3,duration*0.4);
  return [...new Set([0.18,0.32,0.48,0.64,0.8,0.92].map(f=>Number(Math.min(end,Math.max(minimum,duration*f)).toFixed(3))))];
 }
 function scoreFrame(data,width,height){
  let sum=0,sq=0,visible=0,edges=0,n=0;const x0=Math.floor(width*.1),x1=Math.ceil(width*.9),y0=Math.floor(height*.1),y1=Math.ceil(height*.9);
  const lum=(x,y)=>{const i=(y*width+x)*4;return data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;};
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const l=lum(x,y);sum+=l;sq+=l*l;if(l>18)visible++;if(x>x0)edges+=Math.abs(l-lum(x-1,y));if(y>y0)edges+=Math.abs(l-lum(x,y-1));n++;}
  const mean=sum/n,contrast=Math.sqrt(Math.max(0,sq/n-mean*mean)),visibleFraction=visible/n;
  const blank=mean<12||visibleFraction<.12||(mean>244&&contrast<4);
  return {blank,mean,contrast,visibleFraction,score:blank?-1:contrast*.7+edges/n*1.8+visibleFraction*20+Math.min(mean,180)*.06};
 }
 function waitFor(video,event,action,timeout=15000){return new Promise((resolve,reject)=>{
  const done=()=>{clearTimeout(timer);video.removeEventListener(event,ok);video.removeEventListener('error',fail);};
  const ok=()=>{done();resolve();},fail=()=>{done();reject(new Error('Браузер не смог прочитать видео. Попробуйте MP4 с кодеком H.264.'));};
  const timer=setTimeout(()=>{done();reject(new Error('Не удалось прочитать кадр видео за отведённое время'));},timeout);
  video.addEventListener(event,ok,{once:true});video.addEventListener('error',fail,{once:true});try{action();}catch(e){done();reject(e);}
 });}
 function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Не удалось сохранить кадр видео')),'image/jpeg',.86));}
 async function create(file,onProgress=()=>{}){
  if(typeof document==='undefined')throw new Error('Извлечение кадра выполняется в браузере');
  const video=document.createElement('video'),url=URL.createObjectURL(file);video.muted=true;video.playsInline=true;video.preload='auto';video.setAttribute('playsinline','');video.style.cssText='position:fixed;width:1px;height:1px;left:-10px;top:-10px;opacity:0;pointer-events:none';document.body.appendChild(video);
  const sample=document.createElement('canvas');sample.width=160;sample.height=90;const ctx=sample.getContext('2d',{willReadFrequently:true});const full=document.createElement('canvas');let best=null;
  try{
   await waitFor(video,'loadedmetadata',()=>{video.src=url;video.load();});
   const duration=video.duration,times=candidateTimes(duration);if(!video.videoWidth||!video.videoHeight)throw new Error('Не удалось определить размер видео');
   const scale=Math.min(1,1280/video.videoWidth,720/video.videoHeight);full.width=Math.max(1,Math.round(video.videoWidth*scale));full.height=Math.max(1,Math.round(video.videoHeight*scale));
   for(let i=0;i<times.length;i++){
    onProgress(i+1,times.length);const time=times[i];await waitFor(video,'seeked',()=>{video.currentTime=time;});
    if(video.readyState<2)await waitFor(video,'loadeddata',()=>{});
    await new Promise(resolve=>setTimeout(resolve,35));ctx.drawImage(video,0,0,160,90);const metric=scoreFrame(ctx.getImageData(0,0,160,90).data,160,90);
    if(!metric.blank&&(!best||metric.score>best.score)){full.getContext('2d').drawImage(video,0,0,full.width,full.height);best={blob:await canvasBlob(full),time,duration,score:metric.score};}
   }
   if(!best)throw new Error('Не найден видимый кадр: проверенные участки видео чёрные или пустые. Выберите другой ролик.');
   return best;
  }finally{video.pause();video.removeAttribute('src');video.load();video.remove();URL.revokeObjectURL(url);sample.width=sample.height=full.width=full.height=1;}
 }
 return Object.freeze({candidateTimes,scoreFrame,create});
});
