import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('current standalone release embeds scripts and styles and displays its version',async()=>{
 const {version}=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
 const html=await readFile(new URL(`../releases/v${version}/23-17.html`,import.meta.url),'utf8');
 assert.ok(html.includes(`v${version}`));
 assert.ok(html.includes('MidnightRules'));
 let normalizedHtml=html;
 const assets=JSON.parse(await readFile(new URL('../app/assets/manifest.json',import.meta.url),'utf8'));
 for(const asset of assets){const image=await readFile(new URL('../app/'+asset.file,import.meta.url));const uri='data:image/webp;base64,'+image.toString('base64');assert.ok(normalizedHtml.includes(uri),asset.file+' embedded');normalizedHtml=normalizedHtml.replaceAll(uri,asset.file);}
 const modules=await Promise.all(['rules.js','chapter2.js','story-rules.js','story-content.js','art.js','story.js','app.js'].map(f=>readFile(new URL('../app/'+f,import.meta.url),'utf8')));
 assert.ok(normalizedHtml.includes('<script>'+modules.join('\n')+'</script>'),'release embeds all current executable modules in load order');
 assert.ok(html.includes('<style>')&&html.includes('<script>'));
 assert.equal(/<script[^>]*\bsrc\s*=/.test(html),false);
 assert.equal(/<link[^>]*rel="stylesheet"/.test(html),false);
});

test('first reviewed release remains available with original gameplay',async()=>{
 const html=await readFile(new URL('../releases/v0.1.0/23-17.html',import.meta.url),'utf8');
 assert.ok(html.includes('可体验样片 v0.1'));
 assert.ok(html.includes('after-hours-midnight-v01'));
 assert.ok(!html.includes('MidnightRules'));
});
