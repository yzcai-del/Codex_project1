import { readFile, mkdir, writeFile, copyFile, access, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {version}=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
const [html,css,rules,chapter2,storyRules,storyContent,art,story,app]=await Promise.all(['index.html','style.css','rules.js','chapter2.js','story-rules.js','story-content.js','art.js','story.js','app.js'].map(f=>readFile(path.join(root,'app',f),'utf8')));
let js=[rules,chapter2,storyRules,storyContent,art,story,app].join('\n');
const assets=JSON.parse(await readFile(path.join(root,'app/assets/manifest.json'),'utf8'));
for(const asset of assets){
 const data=await readFile(path.join(root,'app',asset.file));
 if(!js.includes(asset.file))throw new Error('Unused or missing asset reference: '+asset.file);
 js=js.replaceAll(asset.file,'data:image/webp;base64,'+data.toString('base64'));
}
if(js.includes('</script>'))throw new Error('Escape inline script closing tags before bundling');
const marker='<link rel="stylesheet" href="style.css"><script defer src="rules.js"></script><script defer src="chapter2.js"></script><script defer src="story-rules.js"></script><script defer src="story-content.js"></script><script defer src="art.js"></script><script defer src="story.js"></script><script defer src="app.js"></script>';
if(!html.includes(marker)||!html.includes('</body>'))throw new Error('Missing bundle insertion point');
const bundle=html.replace(marker,`<style>${css}</style>`).replace('</body>',`<script>${js}</script></body>`);
const dist=path.join(root,'dist');
await mkdir(dist,{recursive:true});
for(const file of ['index.html','style.css','rules.js','chapter2.js','story-rules.js','story-content.js','art.js','story.js','app.js'])await copyFile(path.join(root,'app',file),path.join(dist,file));
await cp(path.join(root,'app/assets'),path.join(dist,'assets'),{recursive:true});
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
