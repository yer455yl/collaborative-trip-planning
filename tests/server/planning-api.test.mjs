import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPlanningHandler} from '../../supabase/functions/planning-api/handler.mjs';
const id='11111111-1111-4111-8111-111111111111';
const request=(command='planning_context',args={p_trip:id},extra={})=>new Request('https://edge.example/planning-api',{method:'POST',headers:{authorization:'Bearer synthetic-token','content-type':'application/json'},body:JSON.stringify({command,args}),...extra});
const config={supabaseUrl:'https://test.supabase.co',anonKey:'synthetic-public-key',allowedOrigins:['https://client.example']};
const response=data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
test('forwards caller JWT to allowlisted RPC, never service-role credentials',async()=>{
 let call;const handle=createPlanningHandler({...config,fetchImpl:async(url,opts)=>{call={url,opts};return response({ok:true});}});
 assert.equal((await handle(request())).status,200);assert.equal(call.url,'https://test.supabase.co/rest/v1/rpc/planning_context');assert.equal(call.opts.headers.Authorization,'Bearer synthetic-token');
});
test('missing authentication denied before any RPC',async()=>{
 const handle=createPlanningHandler({...config,fetchImpl:()=>assert.fail('must not call RPC')});assert.equal((await handle(request('planning_context',{p_trip:id},{headers:{'content-type':'application/json'}}))).status,401);
});
test('unapproved origin, method, content type, ID, command and extra actor fields rejected',async()=>{
 const handle=createPlanningHandler({...config,fetchImpl:()=>assert.fail('must not call RPC')});
 for(const req of [request('planning_context',{p_trip:id},{headers:{origin:'https://attacker.example'}}),new Request('https://edge.example'),request('private.lock_member',{p_trip:id}),request('planning_context',{p_trip:'bad'}),request('save_plan',{p_trip:id,actor:'forged'}),request('constructor',{})])assert.ok((await handle(req)).status>=400);
});
test('actual streamed payload is bounded',async()=>{const handle=createPlanningHandler({...config});assert.equal((await handle(request('planning_context',{p_trip:id,large:'x'.repeat(150000)}))).status,413);});
test('approved origin preflight and no-store response',async()=>{
 const handle=createPlanningHandler({...config,fetchImpl:async()=>response({ok:true})});
 const pre=await handle(new Request('https://edge.example',{method:'OPTIONS',headers:{origin:'https://client.example'}}));assert.equal(pre.status,204);assert.equal(pre.headers.get('access-control-allow-origin'),'https://client.example');
 assert.equal((await handle(request())).headers.get('cache-control'),'no-store');
});
test('database errors are mapped without leaking SQL internals',async()=>{
 for(const [error,status,code]of [[{message:'VERSION_CONFLICT'},409,'VERSION_CONFLICT'],[{message:'password=secret SQL internals'},500,'SERVER_ERROR'],[{message:'FORBIDDEN'},403,'FORBIDDEN']]){
  const handle=createPlanningHandler({...config,fetchImpl:async()=>new Response(JSON.stringify(error),{status:400})});const res=await handle(request());assert.equal(res.status,status);assert.equal((await res.json()).error.code,code);
 }
});
test('unauthorized generation never calls provider',async()=>{
 let calls=0;const handle=createPlanningHandler({...config,plannerUrl:'https://planner.example',plannerKey:'server-only',fetchImpl:async()=>{calls++;return new Response(JSON.stringify({message:'FORBIDDEN'}),{status:403});}});
 assert.equal((await handle(request('generate_plan',{p_trip:id,p_expected_version:0,p_request_key:id}))).status,403);assert.equal(calls,1);
});
test('provider absent is a controlled failure, not a fake AI result',async()=>{
 const handle=createPlanningHandler({...config,fetchImpl:async(url)=>url.endsWith('existing_preview')?response(null):response({trip:{version:0},places:[]})});assert.equal((await handle(request('generate_plan',{p_trip:id,p_expected_version:0,p_request_key:id}))).status,503);
});
test('untrusted provider output is validated by preview RPC and never auto-saved',async()=>{
 const urls=[];const handle=createPlanningHandler({...config,plannerUrl:'https://planner.example',plannerKey:'server-only',fetchImpl:async(url)=>{urls.push(url);if(url.endsWith('existing_preview'))return response(null);if(url.endsWith('planning_context'))return response({trip:{version:0},places:[]});if(url==='https://planner.example')return response({items:[]});return response({status:'ready'});}});
 const res=await handle(request('generate_plan',{p_trip:id,p_expected_version:0,p_request_key:id}));assert.equal((await res.json()).status,'ready');assert.ok(urls[3].endsWith('preview_plan'));assert.ok(!urls.some(x=>x.endsWith('save_plan')));
});
test('network/provider timeout returns controlled response',async()=>{const handle=createPlanningHandler({...config,fetchImpl:async()=>{throw new Error('secret provider details');}});const res=await handle(request());assert.equal(res.status,503);assert.equal((await res.json()).error.code,'UPSTREAM_UNAVAILABLE');});

test('successful generation retry returns stored draft without provider call',async()=>{
 const handle=createPlanningHandler({...config,plannerUrl:'https://planner.example',plannerKey:'server-only',fetchImpl:async(url)=>{assert.ok(url.endsWith('existing_preview'));return response({base_version:0,status:'ready'});}});
 const res=await handle(request('generate_plan',{p_trip:id,p_expected_version:0,p_request_key:id}));assert.equal((await res.json()).status,'ready');
});
