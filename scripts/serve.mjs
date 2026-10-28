import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const assets=JSON.parse(await readFile(path.join(root,'assets/manifest.json'),'utf8'));
const allowed=new Set(['index.html','style.css','rules.js','chapter2.js','story-rules.js','story-content.js','art.js','story.js','app.js','23-17.html','assets/manifest.json',...assets.map(a=>a.file)]);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.json':'application/json; charset=utf-8'};
export async function responseFor(requestUrl){
 const file=new URL(requestUrl,'http://localhost').pathname.slice(1)||'index.html';
 if(!allowed.has(file))return {status:404,type:'text/plain; charset=utf-8',body:'Not found'};
 try{return {status:200,type:types[path.extname(file)],body:await readFile(path.join(root,file))};}
 catch{return {status:404,type:'text/plain; charset=utf-8',body:'Run npm run build first'};}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4173);
 http.createServer(async(req,res)=>{const result=await responseFor(req.url);res.writeHead(result.status,{'Content-Type':result.type,'Cache-Control':'no-cache'});res.end(result.body);}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/`));
}
