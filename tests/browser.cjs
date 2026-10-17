/* Isolated integration test: all GitHub responses are mocked, no real token or publish. */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const assert=require('node:assert/strict');const C=require('../content-utils');
const Crypto=require('../admin-crypto');const TEST_PASSWORD='fixture-only-long-password';let testVault;
const ROOT=path.resolve(__dirname,'..');const BASE=process.env.TAIS_TEST_URL||'http://127.0.0.1:8765';
let published=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'),head='base-commit',sequence=0;const blobs=new Map(),trees=new Map(),commits=new Map(),assets=new Map();let patchCount=0,lastPaths=[],failBlob=false;
function ghResponse(route){
 const req=route.request(),u=new URL(req.url()),p=u.pathname.replace('/repos/kaARAss/---','');const data=req.postDataJSON();let body;
 if(failBlob&&p==='/git/blobs'){failBlob=false;return route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({message:'Simulated network failure'})});}
 if(p===''&&req.method()==='GET')body={permissions:{push:true}};
 else if(p==='/git/ref/heads/main')body={object:{sha:head}};
 else if(p.startsWith('/git/commits/')&&req.method()==='GET')body={tree:{sha:'base-tree'}};
 else if(p==='/contents/index.html')body={encoding:'base64',content:Buffer.from(published).toString('base64')};
 else if(p==='/git/blobs'&&req.method()==='POST'){const sha='blob-'+(++sequence);blobs.set(sha,Buffer.from(data.content,data.encoding));body={sha};}
 else if(p==='/git/trees'&&req.method()==='POST'){const sha='tree-'+(++sequence);trees.set(sha,data.tree);body={sha};}
 else if(p==='/git/commits'&&req.method()==='POST'){const sha='commit-'+(++sequence);commits.set(sha,data);body={sha};}
 else if(p==='/git/refs/heads/main'&&req.method()==='PATCH'){
   assert.equal(data.force,false);const commit=commits.get(data.sha);assert.equal(commit.parents[0],head);const items=trees.get(commit.tree);lastPaths=items.map(i=>i.path);assert.ok(!lastPaths.some(x=>x.includes('admin')||x.includes('config')));
   for(const item of items){const buf=blobs.get(item.sha);if(item.path==='index.html'){C.read(buf.toString());published=buf.toString();}else assets.set('/'+item.path,buf);}head=data.sha;patchCount++;body={object:{sha:head}};
 }else throw new Error('Unexpected mocked GitHub path '+req.method()+' '+p);
 return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
}
async function routeAll(route){const u=new URL(route.request().url());if(u.hostname==='api.github.com')return ghResponse(route);if(u.origin!==BASE)return route.abort();if(u.pathname==='/admin-vault.json')return route.fulfill({contentType:'application/json',body:JSON.stringify(testVault)});if(u.pathname==='/api/admin/check-auth')return route.fulfill({status:404,body:'not found'});if(u.pathname==='/'||u.pathname==='/index.html')return route.fulfill({contentType:'text/html; charset=utf-8',body:published});if(assets.has(u.pathname))return route.fulfill({contentType:/\.mp4$/.test(u.pathname)?'video/mp4':'image/png',body:assets.get(u.pathname)});return route.continue();}
async function login(p){await p.locator('#password').fill(TEST_PASSWORD);await p.locator('#username').fill('kaARAss');await p.locator('#btn-login-submit').click();await p.locator('#dashboard-screen').waitFor({state:'visible'});await p.waitForFunction(()=>appState.data?.monthsData.length===10 && !appState.loading);}
async function pick(p,id,file){await p.locator(id).setInputFiles(path.join(__dirname,'fixtures',file));await p.waitForTimeout(80);}
async function chooseShow(p,index){await p.locator('[data-tab="tab-shows"]').click();await p.locator('#shows-selector .show-pill').nth(index).click();}
async function checkShows(browser,width){
 const context=await browser.newContext({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390});await context.route('**/*',routeAll);const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(BASE,{waitUntil:'networkidle'});await p.locator('#cookie-accept-btn').click().catch(()=>{});
 const d=C.read(published);assert.equal(await p.locator('.event-item').count(),10);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),'no horizontal overflow');
 for(let i=0;i<10;i++){
  if(width===390&&i>0){await p.locator('.events-nav-btn.next').click();await p.waitForFunction(i=>document.querySelector('.events-slider-container').swiper.activeIndex===i,i);await p.waitForTimeout(380);}
  const card=p.locator('.event-seasons .event-item').nth(i);await card.scrollIntoViewIfNeeded();if(width===390)await card.tap();else await card.click();
  const modal=p.locator('.event_tickets.new_modal_layout').filter({visible:true});await modal.waitFor({state:'visible'});assert.equal(await modal.locator('h1').textContent(),d.monthsData[i].title);
  const thumbs=modal.locator('.thumbs-col > div');assert.equal(await thumbs.count(),d.monthsData[i].media.length);
  for(let m=0;m<await thumbs.count();m++){await thumbs.nth(m).click();assert.ok(await modal.locator('.modal-main-display img,.modal-main-display video').count());}
  await modal.locator('.close_event_tickets').click();assert.equal(await p.evaluate(()=>document.body.style.position),'');
 }
 if(width===390){
  for(let i=0;i<9;i++){await p.locator('.events-nav-btn.prev').click();await p.waitForTimeout(370);}
  const rect=await p.locator('.event-seasons .event-item').first().boundingBox();const cdp=await context.newCDPSession(p);const y=Math.round(rect.y+rect.height/2);let x=Math.round(rect.x+rect.width-30);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let n=1;n<=12;n++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:Math.round(x-n*(rect.width-60)/12),y}]});await p.waitForTimeout(15);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(450);
  assert.equal(await p.locator('.events-current-num').textContent(),'2','native touch swipe advances one card');assert.equal(await p.locator('.event_tickets.new_modal_layout').count(),0,'swipe does not open a show');
 }
 await p.locator('a[data-contact="phone"]').first().scrollIntoViewIfNeeded();assert.equal(await p.locator('a[data-contact="phone"]').first().getAttribute('href'),'tel:+79991234567');assert.equal(await p.locator('[data-contact="address"]').innerText(),'Тестовый адрес');
 await p.locator('a[onclick*="openOrderMessengerModal"]').last().click();assert.equal(await p.locator('.order-messenger-btn-tg').getAttribute('data-url'),'https://t.me/test_changed');assert.equal(await p.locator('.order-messenger-btn-tg').getAttribute('onclick'),null);assert.equal(errors.length,0,errors.join('\n'));await context.close();console.log('PASS all 10 shows, gallery, contacts and '+(width===390?'buttons/native swipe':'desktop')+' at '+width+'px');
}
(async()=>{
 testVault=await Crypto.encrypt('test-only-mocked-token',TEST_PASSWORD);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/local/bin/chromium')?'/usr/local/bin/chromium':chromium.executablePath()),headless:true,args:['--no-sandbox']});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.route('**/*',routeAll);const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(BASE+'/admin/',{waitUntil:'networkidle'});
 await p.locator('#password').fill('wrong-password');await p.locator('#btn-login-submit').click();await p.locator('#login-error-msg').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>appState.authenticated),false);assert.equal(await p.evaluate(()=>appState.github.token),'');assert.equal(await p.locator('#password').inputValue(),'');
 await login(p);assert.equal(await p.locator('label[for="password"]').textContent(),'Пароль');
 const stores=await p.evaluate(()=>JSON.stringify({local:{...localStorage},session:{...sessionStorage}}));assert.ok(!stores.includes(TEST_PASSWORD));assert.ok(!stores.includes('test-only-mocked-token'));
 const unchanged=await p.evaluate(()=>TaisContent.stringify(appState.data));
 for(let i=0;i<10;i++){await chooseShow(p,i);await p.evaluate(()=>saveCurrentShowFormToState());}
 assert.equal(await p.evaluate(()=>TaisContent.stringify(appState.data)),unchanged,'viewing and saving shows preserves original HTML');
 assert.deepEqual(await p.evaluate(()=>parsePositionToXY('0% 0%')),{x:0,y:0},'zero crop stays at zero');
 await chooseShow(p,0);const special='Тест "кавычки" </script> $&';await p.locator('#show-title-input').fill(special);await p.locator('#show-details-input').fill('Описание <script>не исполняется</script>\n\nВторая строка');await pick(p,'#upload-card-file','sample.png');await p.locator('#btn-toggle-separate').click();await pick(p,'#upload-card-mobile-file','sample.png');await p.locator('#card-pos-x-slider').fill('27');await p.locator('#card-pos-x-slider').dispatchEvent('input');await p.locator('#card-scale-slider').fill('125');await p.locator('#card-scale-slider').dispatchEvent('input');
 await chooseShow(p,6);const before6=await p.evaluate(()=>appState.data.monthsData[6].media.length);await p.locator('#btn-add-photo').click();await pick(p,'#upload-media-item-file','sample.png');
 await chooseShow(p,7);const before7=await p.evaluate(()=>appState.data.monthsData[7].media.length);await p.locator('#btn-add-video').click();await pick(p,'#upload-media-item-file','sample.png');assert.equal(await p.evaluate(()=>appState.data.monthsData[7].media.length),before7,'wrong media type rejected');await pick(p,'#upload-media-item-file','sample.mp4');
 await p.locator('[data-tab="tab-banner"]').click();await pick(p,'#upload-banner-desktop-file','sample.png');await pick(p,'#upload-banner-mobile-file','sample.png');
 await p.locator('[data-tab="tab-contacts"]').click();await p.locator('#contact-phone').fill('+7 (999) 123-45-67');await p.locator('#contact-email').fill('test@example.com');await p.locator('#contact-address').fill('Тестовый адрес');await p.locator('#link-telegram').fill('https://t.me/test_changed');await p.locator('#link-max').fill('https://max.ru/test_changed');await p.locator('#link-vk-personal').fill('https://vk.com/test_changed');
 await p.locator('#btn-save-all').click();await p.waitForTimeout(700);const draft=await p.evaluate(()=>draftRead());assert.ok(draft.files.length>=5);assert.equal(draft.data.monthsData[0].title,special);
 await p.reload({waitUntil:'networkidle'});await login(p);assert.equal(await p.evaluate(()=>appState.data.monthsData[0].title),special);assert.equal(await p.evaluate(()=>appState.pendingUploads.size),draft.files.length);
 await p.locator('#btn-publish-all').click();await p.waitForFunction(()=>!publishing);assert.equal(patchCount,1,await p.locator('#toast-msg').textContent());let d=C.read(published);assert.equal(d.monthsData[6].media.length,before6+1);assert.equal(d.monthsData[7].media.length,before7+1);assert.ok(!published.includes('blob:'));assert.ok(lastPaths.length>=6);assert.ok(!published.includes('test-only-mocked-token'));assert.ok(d.monthsData[0].mobileImage.includes('_mobile_'));assert.equal(d.showPosMap[1].pos,'27% 50%');assert.equal(d.showPosMap[1].scale,1.25);
 // Repeat an independent publication after fresh auth; previous materials must survive.
 await p.reload({waitUntil:'networkidle'});await login(p);await chooseShow(p,1);await p.locator('#show-title-input').fill('Вторая публикация');await p.locator('#btn-add-photo').click();await pick(p,'#upload-media-item-file','sample.png');failBlob=true;await p.locator('#btn-publish-all').click();await p.waitForFunction(()=>!publishing);assert.equal(patchCount,1);assert.ok(await p.evaluate(()=>appState.pendingUploads.size)>0);assert.ok(await p.evaluate(()=>draftRead()));await p.locator('#btn-publish-all').click();await p.waitForFunction(()=>!publishing);assert.equal(patchCount,2,await p.locator('#toast-msg').textContent());d=C.read(published);assert.equal(d.monthsData[6].media.length,before6+1);assert.equal(d.monthsData[7].media.length,before7+1);
 assert.equal(errors.length,0,errors.join('\n'));await context.close();console.log('PASS admin login, draft+files restore, two-show media upload, banners, contacts, two complete mocked GitHub publications');await checkShows(browser,1280);await checkShows(browser,390);
 const mc=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await mc.route('**/*',routeAll);const mp=await mc.newPage();mp.on('dialog',d=>d.accept());await mp.goto(BASE+'/admin/',{waitUntil:'networkidle'});await login(mp);assert.ok(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile admin has no horizontal overflow');for(let i=0;i<10;i++){await chooseShow(mp,i);assert.ok((await mp.locator('#active-show-title').textContent()).includes(C.read(published).monthsData[i].title));}await mp.screenshot({path:path.join(ROOT,'../tais-review/admin-mobile-fixed.png')});await mc.close();console.log('PASS mobile admin login, layout and all show selectors');
 fs.writeFileSync(path.join(ROOT,'../tais-review/published-test.html'),published);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
