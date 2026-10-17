'use strict';
const express=require('express');
const compression=require('compression');
const path=require('path');
const app=express();
const admin=require('./admin-api');
app.disable('x-powered-by');
if(process.env.TAIS_TRUST_PROXY==='1')app.set('trust proxy',1);
app.use(compression({threshold:1024,filter:(req,res)=>!/\.(mp4|webm|mov)$/i.test(req.path)&&compression.filter(req,res)}));
app.use(express.json({limit:'2mb'}));
app.use(express.urlencoded({extended:false,limit:'2mb'}));
app.use((req,res,next)=>{
  res.set('X-Content-Type-Options','nosniff');res.set('Referrer-Policy','strict-origin-when-cross-origin');
  res.set('X-Frame-Options','SAMEORIGIN');next();
});
app.use('/api/admin',admin);
// Legacy public upload endpoints must never provide an unauthenticated write path.
app.all(['/api/upload','/api/files'],admin.sameOrigin,admin.auth,(req,res)=>res.status(410).json({success:false,error:'Используйте защищённую загрузку в админке'}));
app.use('/api/handler',(req,res)=>res.status(410).json({success:false,error:'Онлайн-продажа билетов не подключена. Для заказа свяжитесь через MAX или Telegram.'}));
app.get(['/admin','/admin/'],(req,res)=>res.sendFile(path.join(__dirname,'admin.html')));
app.use((req,res,next)=>{
  const name=path.basename(req.path).toLowerCase();
  if(req.path.split('/').some(p=>p.startsWith('.'))||/^(?:admin-config.*|server\.js|admin-api\.js|package.*|bun\.lock|.*\.env|.*\.md)$/.test(name)||/^\/(tests|scripts|node_modules)(\/|$)/.test(req.path))return res.sendStatus(404);
  next();
});
app.use(express.static(__dirname,{dotfiles:'deny',setHeaders:(res,file)=>{
  if(/\.(html|js|css|json)$/i.test(file))res.setHeader('Cache-Control','no-cache, must-revalidate');
  else res.setHeader('Cache-Control','public, max-age=604800');
}}));
app.use((err,req,res,next)=>res.status(400).json({success:false,error:'Неверный запрос'}));
if(require.main===module)app.listen(Number(process.env.PORT)||3000,process.env.HOST||'0.0.0.0',()=>console.log('Tais server started'));
module.exports=app;
