import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const allowed=new Set(['index.html','style.css','app.js','23-17.html']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
 const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!allowed.has(file)){res.writeHead(404);res.end('Not found');return;}
 try{res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-cache'});res.end(await readFile(path.join(root,file)));}
 catch{res.writeHead(404);res.end('Run npm run build first');}
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/`));
