'use strict';
const express = require('express');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const multer = require('multer');
const content = require('./content-utils');
const router = express.Router();
const ROOT = __dirname;
const CONFIG = process.env.TAIS_CONFIG_FILE || path.join(os.homedir(), '.tais-show', 'admin-config.json');
const INDEX = path.join(ROOT,'index.html');
const TMP = path.join(os.tmpdir(),'tais-upload');
if (path.resolve(CONFIG).startsWith(ROOT+path.sep)) throw new Error('TAIS_CONFIG_FILE должен находиться вне публичного каталога сайта');
fs.mkdirSync(path.dirname(CONFIG),{recursive:true,mode:0o700});
fs.mkdirSync(TMP,{recursive:true,mode:0o700});
function hashPassword(password) {
  const salt=crypto.randomBytes(16).toString('hex');
  return salt+':'+crypto.scryptSync(password,salt,64).toString('hex');
}
function matchPassword(password,hash) {
  if(typeof password!=='string'||password.length>1024||typeof hash!=='string') return false;
  const [salt,value]=hash.split(':'); if(!salt||!value||!/^[a-f0-9]{128}$/.test(value))return false;
  const expected=Buffer.from(value,'hex');const actual=crypto.scryptSync(password,salt,64);
  return crypto.timingSafeEqual(expected,actual);
}
function writeConfig(cfg) {
  const tmp=CONFIG+'.tmp';fs.writeFileSync(tmp,JSON.stringify(cfg,null,2),{mode:0o600});fs.renameSync(tmp,CONFIG);
}
function config() {
  let cfg=fs.existsSync(CONFIG)?JSON.parse(fs.readFileSync(CONFIG,'utf8')):{admin:{},github:{},pendingFiles:[]};
  let changed=false;
  if(!cfg.admin.tokenSecret){cfg.admin.tokenSecret=crypto.randomBytes(48).toString('hex');changed=true;}
  if(!cfg.admin.passwordHash&&process.env.TAIS_ADMIN_PASSWORD){
    if(process.env.TAIS_ADMIN_PASSWORD.length<12)throw new Error('TAIS_ADMIN_PASSWORD: минимум 12 символов');
    cfg.admin.passwordHash=hashPassword(process.env.TAIS_ADMIN_PASSWORD);changed=true;
  }
  if(!cfg.admin.username){cfg.admin.username=process.env.TAIS_ADMIN_USERNAME||'admin';changed=true;}
  cfg.admin.sessionVersion=cfg.admin.sessionVersion||1;cfg.github=cfg.github||{};cfg.pendingFiles=cfg.pendingFiles||[];
  if(changed)writeConfig(cfg);return cfg;
}
function githubConfig(cfg) {
  return {token:process.env.TAIS_GITHUB_TOKEN||cfg.github.token||'',owner:process.env.TAIS_GITHUB_OWNER||cfg.github.owner||'kaARAss',repo:process.env.TAIS_GITHUB_REPO||cfg.github.repo||'---',branch:process.env.TAIS_GITHUB_BRANCH||cfg.github.branch||'main'};
}
function makeToken(user,cfg){const body=Buffer.from(JSON.stringify({user,version:cfg.admin.sessionVersion,exp:Date.now()+12*60*60*1000})).toString('base64url');return body+'.'+crypto.createHmac('sha256',cfg.admin.tokenSecret).update(body).digest('base64url');}
function verifyToken(token,cfg){
  if(typeof token!=='string'||token.length>2000)return false;
  const [body,sig,...rest]=token.split('.');if(!body||!sig||rest.length)return false;
  const expected=crypto.createHmac('sha256',cfg.admin.tokenSecret).update(body).digest();let actual;
  try{actual=Buffer.from(sig,'base64url');}catch{return false;}
  if(actual.length!==expected.length||!crypto.timingSafeEqual(actual,expected))return false;
  try{const p=JSON.parse(Buffer.from(body,'base64url'));return Number.isFinite(p.exp)&&p.exp>Date.now()&&p.version===cfg.admin.sessionVersion&&p.user===cfg.admin.username?p:false;}catch{return false;}
}
function sameOrigin(req,res,next){
  if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.origin){
    let origin;try{origin=new URL(req.headers.origin);}catch{return res.status(403).json({success:false,error:'Неверный Origin'});}
    if(origin.host!==req.get('host')||origin.protocol.replace(':','')!==req.protocol)return res.status(403).json({success:false,error:'Межсайтовый запрос запрещён'});
  }next();
}
function auth(req,res,next){
  const bearer=req.get('authorization');const cookie=(req.headers.cookie||'').match(/(?:^|;\s*)admin_token=([^;]+)/);
  const user=verifyToken(bearer&&bearer.startsWith('Bearer ')?bearer.slice(7):cookie&&cookie[1],config());
  if(!user)return res.status(401).json({success:false,error:'Требуется авторизация'});req.adminUser=user;next();
}
router.use(sameOrigin);
const attempts=new Map();
function limitLogin(req,res,next){
  const now=Date.now();for(const [key,val]of attempts)if(val.until<now)attempts.delete(key);
  const key=req.ip;const state=attempts.get(key)||{n:0,until:now+15*60*1000};state.n++;attempts.set(key,state);
  if(state.n>10)return res.status(429).json({success:false,error:'Слишком много попыток. Повторите через 15 минут.'});next();
}
const cookieOptions=req=>({httpOnly:true,sameSite:'strict',secure:req.secure,path:'/',maxAge:12*60*60*1000});
router.post('/login',limitLogin,(req,res)=>{
  const cfg=config();if(!cfg.admin.passwordHash)return res.status(503).json({success:false,error:'Сервер не настроен: задайте TAIS_ADMIN_PASSWORD (минимум 12 символов)'});
  const{username,password}=req.body||{};
  if(username!==cfg.admin.username||!matchPassword(password,cfg.admin.passwordHash))return res.status(401).json({success:false,error:'Неверный логин или пароль'});
  attempts.delete(req.ip);res.cookie('admin_token',makeToken(username,cfg),cookieOptions(req));res.json({success:true,user:{username}});
});
router.get('/check-auth',auth,(req,res)=>res.json({success:true,user:{username:req.adminUser.user}}));
router.post('/logout',(req,res)=>{res.clearCookie('admin_token',{...cookieOptions(req),maxAge:undefined});res.json({success:true});});
router.post('/change-password',auth,(req,res)=>{
  const cfg=config();const {currentPassword,newPassword}=req.body||{};
  if(!matchPassword(currentPassword,cfg.admin.passwordHash))return res.status(400).json({success:false,error:'Неверный текущий пароль'});
  if(typeof newPassword!=='string'||newPassword.length<12||newPassword.length>1024)return res.status(400).json({success:false,error:'Новый пароль: от 12 до 1024 символов'});
  cfg.admin.passwordHash=hashPassword(newPassword);cfg.admin.sessionVersion++;writeConfig(cfg);res.clearCookie('admin_token',{...cookieOptions(req),maxAge:undefined});res.json({success:true});
});
router.get('/data',auth,(req,res)=>{try{res.json({success:true,data:content.read(fs.readFileSync(INDEX,'utf8')),github:{hasToken:Boolean(githubConfig(config()).token)}});}catch(e){res.status(500).json({success:false,error:e.message});}});
let saveLock=false;
router.post('/save-data',auth,(req,res)=>{
  if(saveLock)return res.status(409).json({success:false,error:'Сохранение уже выполняется'});saveLock=true;
  try{
    const html=fs.readFileSync(INDEX,'utf8');
    if(req.body.baseContent&&content.stringify(content.read(html))!==req.body.baseContent)return res.status(409).json({success:false,error:'Сайт изменён в другой сессии. Обновите данные.'});
    const data=content.validate(req.body.data);const next=content.write(html,data);
    const cfg=config();if(!cfg.publishBase)cfg.publishBase=content.stringify(content.read(html));writeConfig(cfg);
    fs.writeFileSync(INDEX+'.tmp',next);fs.renameSync(INDEX+'.tmp',INDEX);res.json({success:true,message:'Сайт сохранён на сервере'});
  }catch(e){res.status(400).json({success:false,error:e.message});}finally{saveLock=false;}
});
const PATH_RE=/^(?:img\/(?:index|block)\/)?[a-zA-Z0-9][\w.-]*\.(png|jpe?g|webp|gif|avif|mp4|webm|mov|m4v)$/i;
const upload=multer({dest:TMP,limits:{fileSize:95*1024*1024,files:1,fields:2}});
async function verifyFile(file,relativePath){
  const h=await fsp.open(file.path,'r');const b=Buffer.alloc(32);try{await h.read(b,0,32,0);}finally{await h.close();}
  const text=b.toString('latin1');const image=(b[0]===137&&text.slice(1,4)==='PNG')||(b[0]===255&&b[1]===216&&b[2]===255)||text.startsWith('GIF8')||(text.startsWith('RIFF')&&text.slice(8,12)==='WEBP')||(text.slice(4,8)==='ftyp'&&/avif|avis/.test(text));
  const video=(text.slice(4,8)==='ftyp'&&!/avif|avis/.test(text))||b.subarray(0,4).equals(Buffer.from([26,69,223,163]));
  if(/\.(mp4|webm|mov|m4v)$/i.test(relativePath)?!video:!image)throw new Error('Содержимое файла не соответствует формату');
}
router.post('/upload-media',auth,upload.single('mediaFile'),async(req,res)=>{
  const file=req.file;if(!file)return res.status(400).json({success:false,error:'Файл не выбран'});
  try{
    const relativePath=req.body.relativePath||'img/block/'+crypto.randomUUID()+path.extname(file.originalname).toLowerCase();
    if(!PATH_RE.test(relativePath))throw new Error('Недопустимый путь файла');await verifyFile(file,relativePath);
    const dest=path.join(ROOT,relativePath);await fsp.mkdir(path.dirname(dest),{recursive:true});await fsp.copyFile(file.path,dest);
    const cfg=config();cfg.pendingFiles=[...new Set([...cfg.pendingFiles,relativePath])];writeConfig(cfg);
    res.json({success:true,file:{name:path.basename(dest),url:'/'+relativePath,size:file.size,isVideo:/\.(mp4|webm|mov|m4v)$/i.test(relativePath)}});
  }catch(e){res.status(400).json({success:false,error:e.message});}finally{await fsp.unlink(file.path).catch(()=>{});}
});
router.get('/files',auth,async(req,res)=>{try{const dir=path.join(ROOT,'img/block');const names=await fsp.readdir(dir);res.json({success:true,files:names.filter(n=>PATH_RE.test(n))});}catch(e){res.status(500).json({success:false,error:e.message});}});
router.post('/github/settings',auth,(req,res)=>{const cfg=config();const{token,owner,repo,branch}=req.body||{};for(const [key,value]of Object.entries({token,owner,repo,branch}))if(value!==undefined){if(typeof value!=='string'||value.length>1000)return res.status(400).json({success:false,error:'Некорректная настройка'});cfg.github[key]=value.trim();}writeConfig(cfg);res.json({success:true});});
async function gh(cfg,pathname,options={}){
  const g=githubConfig(cfg);const response=await fetch('https://api.github.com/repos/'+encodeURIComponent(g.owner)+'/'+encodeURIComponent(g.repo)+pathname,{...options,headers:{Authorization:'Bearer '+g.token,Accept:'application/vnd.github+json','Content-Type':'application/json','User-Agent':'Tais-Admin',...options.headers},signal:AbortSignal.timeout(120000)});
  const data=await response.json();if(!response.ok)throw new Error('GitHub '+response.status+': '+(data.message||'ошибка'));return data;
}
router.post('/github/test',auth,async(req,res)=>{try{const data=await gh(config(),'');res.json({success:true,permissions:data.permissions});}catch(e){res.status(400).json({success:false,error:e.message});}});
let publishing=false;
router.post('/publish',auth,async(req,res)=>{
  if(publishing)return res.status(409).json({success:false,error:'Публикация уже выполняется'});publishing=true;
  try{
    const cfg=config();const g=githubConfig(cfg);
    if(!g.token)return res.json({success:true,localOnly:true});
    const html=await fsp.readFile(INDEX,'utf8');content.read(html);
    const ref=await gh(cfg,'/git/ref/heads/'+encodeURIComponent(g.branch));const commit=await gh(cfg,'/git/commits/'+ref.object.sha);
    const remote=await gh(cfg,'/contents/index.html?ref='+ref.object.sha);
    if(cfg.publishBase&&content.stringify(content.read(Buffer.from(remote.content,'base64').toString('utf8')))!==cfg.publishBase)throw new Error('GitHub уже изменён в другой сессии. Сайт сохранён на сервере, но публикация остановлена во избежание перезаписи.');
    const tree=[];const files=['index.html',...cfg.pendingFiles.filter(f=>PATH_RE.test(f))];
    for(const name of files){const bytes=await fsp.readFile(path.join(ROOT,name));const blob=await gh(cfg,'/git/blobs',{method:'POST',body:JSON.stringify({content:bytes.toString('base64'),encoding:'base64'})});tree.push({path:name,mode:'100644',type:'blob',sha:blob.sha});}
    const newTree=await gh(cfg,'/git/trees',{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree})});
    const c=await gh(cfg,'/git/commits',{method:'POST',body:JSON.stringify({message:'Обновление контента Та-Ис через админку',tree:newTree.sha,parents:[ref.object.sha]})});
    await gh(cfg,'/git/refs/heads/'+encodeURIComponent(g.branch),{method:'PATCH',body:JSON.stringify({sha:c.sha,force:false})});
    // Do not publish credentials, backend source, unrelated media, or admin HTML.
    const latest=config();delete latest.publishBase;latest.pendingFiles=latest.pendingFiles.filter(f=>!cfg.pendingFiles.includes(f));latest.github.lastCommitSha=c.sha;writeConfig(latest);
    res.json({success:true,commitSha:c.sha.slice(0,7)});
  }catch(e){res.status(500).json({success:false,error:e.message});}finally{publishing=false;}
});
router.use((err,req,res,next)=>{if(res.headersSent)return next(err);res.status(400).json({success:false,error:err.code==='LIMIT_FILE_SIZE'?'Файл больше 95 МБ':err.message});});
module.exports=router;
module.exports.auth=auth;
module.exports.sameOrigin=sameOrigin;
