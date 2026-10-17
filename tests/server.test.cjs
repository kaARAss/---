const test=require('node:test');const assert=require('node:assert/strict');const fs=require('fs');const os=require('os');const path=require('path');const C=require('../content-utils');
test('server: authentication, no public writes/secrets, uploads, validated saves and password rotation',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tais-test-'));const root=path.join(dir,'site');fs.mkdirSync(root);for(const f of ['server.js','admin-api.js','content-utils.js','index.html','admin.html'])fs.copyFileSync(path.join(__dirname,'..',f),path.join(root,f));fs.symlinkSync(path.join(__dirname,'../node_modules'),path.join(root,'node_modules'),'dir');
 const old={...process.env};process.env.TAIS_CONFIG_FILE=path.join(dir,'private','config.json');process.env.TAIS_ADMIN_PASSWORD='test-only-strong-password';process.env.TAIS_ADMIN_USERNAME='test-admin';delete process.env.TAIS_GITHUB_TOKEN;
 const app=require(path.join(root,'server'));const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 const req=(p,options={})=>fetch(base+p,options);let cookie;
 const post=(p,body,authenticated=true)=>req(p,{method:'POST',headers:{'Content-Type':'application/json',...(authenticated&&cookie?{cookie}:{})},body:JSON.stringify(body)});
 try{
  assert.equal((await req('/api/admin/check-auth')).status,401);assert.equal((await post('/api/upload',{},false)).status,401);assert.equal((await req('/api/files')).status,401);
  for(const f of ['/server.js','/admin-api.js','/.env','/admin-config.json','/tests/server.test.cjs','/package-lock.json'])assert.equal((await req(f)).status,404,f);
  assert.equal((await post('/api/admin/login',{username:'test-admin',password:'wrong-password'},false)).status,401);
  let r=await post('/api/admin/login',{username:'test-admin',password:'test-only-strong-password'},false);assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/SameSite=Strict/);
  r=await req('/api/admin/data',{headers:{cookie}});assert.equal(r.status,200);let data=(await r.json()).data;const baseline=C.stringify(data);
  assert.equal((await post('/api/admin/save-data',{data:{monthsData:[]},baseContent:baseline})).status,400);
  data.monthsData[0].title='Серверный тест " </script>';r=await post('/api/admin/save-data',{data,baseContent:baseline});assert.equal(r.status,200);assert.equal(C.read(fs.readFileSync(path.join(root,'index.html'),'utf8')).monthsData[0].title,data.monthsData[0].title);
  assert.equal((await post('/api/admin/save-data',{data,baseContent:baseline})).status,409);
  r=await req('/api/admin/logout',{method:'POST',headers:{cookie,origin:'https://foreign.example'}});assert.equal(r.status,403);
  let form=new FormData();form.append('relativePath','img/block/test.png');form.append('mediaFile',new Blob([fs.readFileSync(path.join(__dirname,'fixtures/sample.png'))]),'test.png');r=await req('/api/admin/upload-media',{method:'POST',headers:{cookie},body:form});assert.equal(r.status,200);assert.ok(fs.existsSync(path.join(root,'img/block/test.png')));
  form=new FormData();form.append('relativePath','../bad.png');form.append('mediaFile',new Blob(['not an image']),'test.png');r=await req('/api/admin/upload-media',{method:'POST',headers:{cookie},body:form});assert.equal(r.status,400);
  form=new FormData();form.append('relativePath','img/block/script.png');form.append('mediaFile',new Blob(['<script>alert(1)</script>']),'test.png');r=await req('/api/admin/upload-media',{method:'POST',headers:{cookie},body:form});assert.equal(r.status,400);
  r=await post('/api/admin/publish',{});assert.equal(r.status,200);assert.equal((await r.json()).localOnly,true);
  assert.equal((await post('/api/admin/change-password',{currentPassword:'wrong',newPassword:'another-test-password'})).status,400);
  assert.equal((await post('/api/admin/change-password',{currentPassword:'test-only-strong-password',newPassword:'another-test-password'})).status,200);assert.equal((await req('/api/admin/check-auth',{headers:{cookie}})).status,401);
  assert.equal((await post('/api/admin/login',{username:'test-admin',password:'test-only-strong-password'},false)).status,401);assert.equal((await post('/api/admin/login',{username:'test-admin',password:'another-test-password'},false)).status,200);
  assert.ok(!fs.readFileSync(process.env.TAIS_CONFIG_FILE,'utf8').includes('another-test-password'));
 }finally{await new Promise(r=>server.close(r));server.closeAllConnections();for(const key of ['TAIS_CONFIG_FILE','TAIS_ADMIN_PASSWORD','TAIS_ADMIN_USERNAME','TAIS_GITHUB_TOKEN']){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];}fs.rmSync(dir,{recursive:true,force:true});}
});
