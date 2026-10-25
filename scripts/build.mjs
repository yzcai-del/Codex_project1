import { readFile, mkdir, writeFile, copyFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {version}=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
const [html,css,js]=await Promise.all(['index.html','style.css','app.js'].map(f=>readFile(path.join(root,'app',f),'utf8')));
if(js.includes('</script>'))throw new Error('Escape inline script closing tags before bundling');
const bundle=html.replace('<link rel="stylesheet" href="style.css"><script defer src="app.js"></script>',`<style>${css}</style>`).replace('</body>',`<script>${js}</script></body>`);
if(bundle===html)throw new Error('Missing bundle insertion point');
const dist=path.join(root,'dist');
await mkdir(dist,{recursive:true});
for(const file of ['index.html','style.css','app.js'])await copyFile(path.join(root,'app',file),path.join(dist,file));
await writeFile(path.join(dist,'23-17.html'),bundle);
if(process.argv.includes('--release')){
 const target=path.join(root,'releases',`v${version}`,'23-17.html');
 let exists=true;try{await access(target);}catch{exists=false;}
 if(exists&&await readFile(target,'utf8')!==bundle)throw new Error('Historical release is immutable; increment package.json version');
 await mkdir(path.dirname(target),{recursive:true});
 if(!exists)await writeFile(target,bundle);
 console.log(`Release fixed: releases/v${version}/23-17.html`);
}
console.log(`Built v${version}`);
