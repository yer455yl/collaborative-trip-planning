import {test}from'node:test';import assert from'node:assert/strict';
import{planningClient}from'../../supabase/functions/_shared/planning-client.mjs';
test('client reloads one authoritative snapshot rather than mixing plan versions',async()=>{
 const calls=[];const client=planningClient({endpoint:'https://edge.example',publicKey:'public',getAccessToken:async()=> 'synthetic',fetchImpl:async(_,opts)=>{calls.push(JSON.parse(opts.body));return new Response(JSON.stringify({trip:{version:3},items:[{version:3}],votes:[]}));}});
 const snapshot=await client.snapshot('trip-a');assert.equal(snapshot.trip.version,snapshot.items[0].version);assert.deepEqual(calls,[{command:'get_trip_snapshot',args:{p_trip:'trip-a'}}]);
});
test('client preserves save request key and surfaces stale conflict without automatic overwrite',async()=>{
 const calls=[];const client=planningClient({endpoint:'https://edge.example',publicKey:'public',getAccessToken:async()=> 'synthetic',fetchImpl:async(_,opts)=>{calls.push(JSON.parse(opts.body));return new Response(JSON.stringify({error:{code:'VERSION_CONFLICT'}}),{status:409});}});
 await assert.rejects(()=>client.save({tripId:'trip-a',expectedVersion:2,items:[],requestKey:'same-key'}),e=>e.code==='VERSION_CONFLICT');assert.equal(calls.length,1);assert.equal(calls[0].args.p_request_key,'same-key');
});
