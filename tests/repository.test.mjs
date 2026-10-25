import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('public ignore rules exclude local development records',async()=>{
 const ignore=await readFile(new URL('../.gitignore',import.meta.url),'utf8');
 for(const entry of ['/experiment/','/.local/','/AGENTS.md'])assert.ok(ignore.split(/\r?\n/).includes(entry),`${entry} must stay local`);
});

test('public documentation includes gameplay, story, introduction and changelog',async()=>{
 for(const name of ['README.md','CHANGELOG.md','docs/GAMEPLAY.md','docs/STORY.md'])assert.ok((await readFile(new URL(`../${name}`,import.meta.url),'utf8')).trim().length>100);
});
