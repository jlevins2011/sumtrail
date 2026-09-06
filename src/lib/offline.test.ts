// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect,it,vi } from 'vitest';
const source=readFileSync(new URL('../../public/sw.js',import.meta.url),'utf8');
it('only removes old Sumtrail caches, preserving sibling games',async()=>{
 const handlers:Record<string,(e:any)=>void>={};
 const remove=vi.fn(async()=>true);
 runInNewContext(source,{URL,self:{registration:{scope:'https://example.test/sumtrail/'},addEventListener:(name:string,fn:any)=>handlers[name]=fn,clients:{claim(){}},skipWaiting(){}},caches:{keys:async()=>['sumtrail-shell-v1','sumtrail-shell-v2','keytrail-v1','lumen-v1'],delete:remove}});
 let work:Promise<unknown>=Promise.resolve();handlers.activate({waitUntil:(p:Promise<unknown>)=>work=p});await work;
 expect(remove.mock.calls).toEqual([['sumtrail-shell-v1']]);
});
it('returns the cached shell only for offline navigation, never for missing assets',async()=>{
 const handlers:Record<string,(e:any)=>void>={};
 const cache={match:async(key:any)=>typeof key==='string'&&key.endsWith('index.html')?'shell':undefined};
 runInNewContext(source,{URL,Response,self:{registration:{scope:'https://example.test/sumtrail/'},addEventListener:(name:string,fn:any)=>handlers[name]=fn},caches:{open:async()=>cache},fetch:async()=>{throw Error('offline');}});
 async function request(mode:string){let result:any;handlers.fetch({request:{url:'https://example.test/sumtrail/missing.js',method:'GET',mode},respondWith:(p:any)=>result=p});return await result;}
 expect(await request('navigate')).toBe('shell');
 expect((await request('cors')).type).toBe('error');
});
