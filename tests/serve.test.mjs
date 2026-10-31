import test from 'node:test';
import assert from 'node:assert/strict';
import {responseFor} from '../scripts/serve.mjs';
test('distribution serves every executable chapter and artwork file with the right MIME type',async()=>{
 const index=await responseFor('/');assert.equal(index.status,200);assert.match(index.type,/text\/html/);
 const text=index.body.toString();const sources=[...text.matchAll(/src="([^"]+\.js)"/g)].map(x=>x[1]);
 assert.ok(sources.length>=7);
 for(const file of sources){const r=await responseFor('/'+file);assert.equal(r.status,200,file);assert.match(r.type,/javascript/);}
 const manifest=JSON.parse((await responseFor('/assets/manifest.json')).body);
 assert.equal(manifest.length,4);
 for(const a of manifest){const r=await responseFor('/'+a.file);assert.equal(r.status,200);assert.equal(r.type,'image/webp');assert.equal(r.body.toString('ascii',0,4),'RIFF');assert.equal(r.body.toString('ascii',8,12),'WEBP');}
});
test('the distribution never serves author notes, traversal targets or unlisted files',async()=>{
 for(const url of ['/.local/private-note.md','/AGENTS.md','/../package.json','/assets/../../.git/config','/unknown.js'])assert.equal((await responseFor(url)).status,404,url);
});
