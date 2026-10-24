import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {randomUUID} from 'node:crypto';

// Only the harness supplies Auth identities. Never apply these auth stubs to Supabase.
let db;
if(process.env.TEST_DATABASE_URL){
 const url=new URL(process.env.TEST_DATABASE_URL);
 if(!['localhost','127.0.0.1'].includes(url.hostname)||process.env.ALLOW_DATABASE_TEST_STUBS!=='1')throw new Error('Auth stubs require explicitly permitted disposable localhost PostgreSQL');
 const {Client}=await import('pg');const client=new Client({connectionString:process.env.TEST_DATABASE_URL});await client.connect();
 db={query:(...args)=>client.query(...args),exec:(sql)=>client.query(sql),close:()=>client.end()};
}else db=new PGlite();
const O=randomUUID(), E=randomUUID(), X=randomUUID(), L=randomUUID();
const place=randomUUID(), groupPlace=randomUUID();
const migration=await readFile(new URL('../../supabase/migrations/202610240001_mvp.sql',import.meta.url),'utf8');
await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth,public to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
await db.exec(migration);
for (const id of [O,E,X,L]) await db.query('insert into auth.users values($1)',[id]);
async function actor(id,role='authenticated') {await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']);await db.exec('set role '+role);}
async function admin(){await db.exec('reset role');}
async function rpc(name,args){const marks=args.map((_,i)=>'$'+(i+1)).join(',');return (await db.query(`select public.${name}(${marks}) as result`,args)).rows[0].result;}
const input=()=>({title:'Synthetic Astana trip',destination:'Astana',start_date:'2026-10-24',end_date:'2026-10-26',travelers_count:3,trip_type:'fixture',budget:'10000.00',time_zone:'Asia/Almaty',trip_interests:['museum']});
const items=(id=randomUUID(),p=place)=>[{id,place_id:p,day_date:'2026-10-24',position:0,starts_at:'2026-10-24T05:00:00Z',estimated_cost:'0.01'}];
const denied=async(fn,code)=>assert.rejects(fn,code?new RegExp(code):undefined);
let trip, tripB, token, initialItems, firstSave, proposal;
await test('PostgreSQL migration, RLS and transaction suite (Auth stub; no Supabase network)',async t=>{
 await t.test('migration creates eight RLS-protected MVP tables',async()=>{
  const rows=(await db.query("select relname,relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'")).rows;
  assert.equal(rows.length,8);assert.ok(rows.every(x=>x.relrowsecurity));
 });
 await t.test('authenticated profiles use current identity; anonymous denied',async()=>{
  for(const id of [O,E,X,L]){await actor(id);await rpc('upsert_profile',['Fixture '+id.slice(0,4),'en']);}
  await actor(null,'anon');await denied(()=>rpc('upsert_profile',['Anonymous','en']),'permission denied');
 });
 await t.test('create trip atomically with one owner and retry same result',async()=>{
  await actor(O);const key=randomUUID();const result=await rpc('create_trip',[input(),key]);trip=result.trip_id;
  assert.deepEqual(await rpc('create_trip',[input(),key]),result);
  const rows=(await db.query('select * from public.participants where trip_id=$1',[trip])).rows;assert.equal(rows.length,1);assert.equal(rows[0].role,'owner');
 });
 await t.test('reject invalid date, budget precision, traveler count, timezone without partial trip',async()=>{
  for(const patch of [{start_date:'2026-02-30'},{budget:'1.001'},{travelers_count:0},{time_zone:'Invalid/Zone'}]) await denied(()=>rpc('create_trip',[{...input(),...patch},randomUUID()]));
  assert.equal((await db.query('select count(*)::int as n from public.trips')).rows[0].n,1);
 });
 await t.test('outsider and anonymous cannot read private trip',async()=>{
  await actor(X);tripB=(await rpc('create_trip',[input(),randomUUID()])).trip_id;
  assert.equal((await db.query('select * from public.trips where id=$1',[trip])).rows.length,0);
  await actor(null,'anon');await denied(()=>db.query('select * from public.trips'),'permission denied');
 });
 await t.test('direct table writes and internal helpers are not client privileges',async()=>{
  await actor(O);await denied(()=>db.query('update public.trips set budget=1 where id=$1',[trip]),'permission denied');
  await denied(()=>db.query('select private.lock_member($1)',[trip]),'permission denied');
  await denied(()=>db.query('select * from private.command_results'),'permission denied');
 });
 await t.test('owner issues hashed token; stranger cannot issue',async()=>{
  await actor(X);await denied(()=>rpc('issue_invitation',[trip]),'FORBIDDEN');
  await actor(O);token=(await rpc('issue_invitation',[trip])).token;
  await denied(()=>db.query('select * from public.invitations'),'permission denied');
  await admin();const stored=(await db.query('select token_hash from public.invitations where trip_id=$1',[trip])).rows[0].token_hash;assert.notEqual(stored,token);assert.equal(stored.length,64);
 });
 await t.test('acceptance is retry-safe and cannot be replayed by different recipient',async()=>{
  await actor(E);const result=await rpc('accept_invitation',[token]);assert.deepEqual(await rpc('accept_invitation',[token]),result);
  assert.equal((await db.query('select * from public.participants where trip_id=$1 and user_id=$2',[trip,E])).rows.length,1);
  await actor(X);await denied(()=>rpc('accept_invitation',[token]),'INVITATION_CONSUMED');
 });
 await t.test('expired and revoked invitations fail',async()=>{
  await actor(O);const expired=await rpc('issue_invitation',[trip]);const revoked=await rpc('issue_invitation',[trip]);await rpc('revoke_invitation',[trip,revoked.invitation_id]);
  await admin();await db.query("update public.invitations set expires_at=now()-interval '1 second' where id=$1",[expired.invitation_id]);
  await actor(L);await denied(()=>rpc('accept_invitation',[expired.token]),'INVALID_INVITATION');await denied(()=>rpc('accept_invitation',[revoked.token]),'INVALID_INVITATION');
 });
 await t.test('editor may read but not administer membership; last owner protected',async()=>{
  await actor(E);assert.equal((await db.query('select * from public.trips where id=$1',[trip])).rows.length,1);
  await denied(()=>rpc('issue_invitation',[trip]),'FORBIDDEN');await denied(()=>rpc('remove_participant',[trip,O]),'FORBIDDEN');
  await actor(O);await denied(()=>rpc('remove_participant',[trip,O]),'LAST_OWNER');
 });
 await t.test('catalog fixtures and policy are provisioned only by administrator',async()=>{
  await admin();await db.query("insert into private.budget_policies values('fixture',array['visit'],interval '1 day',15,true)");
  const hours=Object.fromEntries(Array.from({length:7},(_,i)=>[String(i+1),[{open:'09:00',close:'18:00'}]]));
  for(const [id,unit,price] of [[place,'per_person','2500.00'],[groupPlace,'per_group','7500.00']])await db.query(`insert into public.places(id,name,category,latitude,longitude,address,opening_hours,estimated_cost,cost_unit,duration_minutes,cost_category,source_url,checked_at,is_active) values($1,'Synthetic museum','museum',51.1,71.4,'Fixture only',$2,$3,$4,60,'visit','https://example.invalid/synthetic',now(),true)`,[id,JSON.stringify(hours),price,unit]);
  await actor(E);await denied(()=>db.query('update public.places set estimated_cost=0'),'permission denied');
 });
 await t.test('manual save independently computes raw per-person cost, ignores client total',async()=>{
  await actor(E);initialItems=items();firstSave=await rpc('save_plan',[trip,0,JSON.stringify(initialItems),randomUUID()]);assert.equal(firstSave.budget.total,'7500.00');assert.equal(firstSave.applied_version,1);
  const saved=(await db.query('select estimated_cost::text as cost from public.plan_items where trip_id=$1',[trip])).rows;assert.equal(saved[0].cost,'7500.00');
  const snapshot=await rpc('get_trip_snapshot',[trip]);assert.equal(snapshot.trip.version,1);assert.equal(snapshot.items[0].version,1);assert.equal(snapshot.participants.length,2);assert.equal(snapshot.votes.length,0);
 });
 await t.test('whole-group source price is not multiplied again',async()=>{
  await actor(E);const result=await rpc('save_plan',[trip,1,JSON.stringify(items(initialItems[0].id,groupPlace)),randomUUID()]);assert.equal(result.budget.total,'7500.00');
 });
 await t.test('stale version rejects without losing current state',async()=>{
  await denied(()=>rpc('save_plan',[trip,1,JSON.stringify(initialItems),randomUUID()]),'VERSION_CONFLICT');assert.equal((await db.query('select version from public.trips where id=$1',[trip])).rows[0].version,2);
 });
 await t.test('same request replays; changed payload with same key conflicts',async()=>{
  const key=randomUUID();const result=await rpc('save_plan',[trip,2,JSON.stringify(initialItems),key]);assert.deepEqual(await rpc('save_plan',[trip,2,JSON.stringify(initialItems),key]),result);
  await denied(()=>rpc('save_plan',[trip,2,JSON.stringify(items()),key]),'IDEMPOTENCY_CONFLICT');
 });
 await t.test('one current vote, change, replay and withdrawal',async()=>{
  const key=randomUUID();const result=await rpc('cast_vote',[trip,initialItems[0].id,1,key]);assert.equal(result.tally,1);assert.deepEqual(await rpc('cast_vote',[trip,initialItems[0].id,1,key]),result);
  assert.equal((await rpc('cast_vote',[trip,initialItems[0].id,-1,randomUUID()])).tally,-1);
  assert.equal((await db.query('select * from public.votes where trip_id=$1',[trip])).rows.length,1);
  await denied(()=>rpc('cast_vote',[trip,initialItems[0].id,2,randomUUID()]));
  assert.equal((await rpc('cast_vote',[trip,initialItems[0].id,null,randomUUID()])).tally,0);
 });
 await t.test('outsider cannot save, vote, preview or read context',async()=>{
  await actor(X);for(const [name,args] of [['save_plan',[trip,3,JSON.stringify(initialItems),randomUUID()]],['cast_vote',[trip,initialItems[0].id,1,randomUUID()]],['preview_plan',[trip,3,JSON.stringify(initialItems),randomUUID()]],['planning_context',[trip]],['get_trip_snapshot',[trip]]])await denied(()=>rpc(name,args),'FORBIDDEN');
 });
 await t.test('preview validates without changing saved itinerary; retry stable',async()=>{
  await actor(E);const key=randomUUID();proposal=await rpc('preview_plan',[trip,3,JSON.stringify(initialItems),key]);assert.equal(proposal.status,'ready');assert.deepEqual(await rpc('preview_plan',[trip,3,JSON.stringify(initialItems),key]),proposal);
  assert.equal((await db.query('select version from public.trips where id=$1',[trip])).rows[0].version,3);
 });
 await t.test('confirmation requires explicit consent and revalidates; same retry stable',async()=>{
  await denied(()=>rpc('save_plan',[trip,3,'[]',randomUUID(),proposal.proposal_id,false]),'INVALID_PROPOSAL');
  const key=randomUUID();const saved=await rpc('save_plan',[trip,3,'[]',key,proposal.proposal_id,true]);assert.equal(saved.applied_version,4);assert.deepEqual(await rpc('save_plan',[trip,3,'[]',key,proposal.proposal_id,true]),saved);
 });
 await t.test('second confirmation with a new key cannot apply a proposal twice',async()=>{
  await denied(()=>rpc('save_plan',[trip,4,'[]',randomUUID(),proposal.proposal_id,true]),'INVALID_PROPOSAL');
 });
 await t.test('over-budget and unknown/stale/future catalog prices are rejected',async()=>{
  for(const [sql,code] of [["estimated_cost=3333.34",'OVER_BUDGET'],['estimated_cost=null','INCOMPLETE_ESTIMATE'],["checked_at=now()-interval '2 days'",'STALE_PRICE'],["checked_at=now()+interval '1 day'",'STALE_PRICE']]){
   await admin();await db.query(`update public.places set ${sql} where id=$1`,[place]);
   await actor(E);await denied(()=>rpc('save_plan',[trip,4,JSON.stringify(initialItems),randomUUID()]),code);
   await admin();await db.query('update public.places set estimated_cost=2500,checked_at=now() where id=$1',[place]);
  }
 });
 await t.test('independent SQL budget accepts exact boundary and rejects one cent over',async()=>{
  await admin();await db.query("update public.places set cost_unit='per_group',estimated_cost=10000.00 where id=$1",[place]);
  await actor(E);assert.equal((await rpc('preview_plan',[trip,4,JSON.stringify(initialItems),randomUUID()])).budget.total,'10000.00');
  await admin();await db.query('update public.places set estimated_cost=10000.01 where id=$1',[place]);
  await actor(E);await denied(()=>rpc('preview_plan',[trip,4,JSON.stringify(initialItems),randomUUID()]),'OVER_BUDGET');
  await admin();await db.query("update public.places set cost_unit='per_person',estimated_cost=2500.00 where id=$1",[place]);
 });
 await t.test('missing approved policy/category fails closed',async()=>{
  await admin();await db.query("update private.budget_policies set approved=false");await actor(E);await denied(()=>rpc('save_plan',[trip,4,JSON.stringify(initialItems),randomUUID()]),'BUDGET_POLICY_NOT_CONFIGURED');
  await admin();await db.query("update private.budget_policies set approved=true,required_categories=array['lodging']");await actor(E);await denied(()=>rpc('save_plan',[trip,4,JSON.stringify(initialItems),randomUUID()]),'INCOMPLETE_ESTIMATE');
  await admin();await db.query("update private.budget_policies set required_categories=array['visit']");
 });
 await t.test('unknown/inactive places, duplicate charges and out-of-trip dates rejected',async()=>{
  await actor(E);
  for(const [payload,code] of [[items(randomUUID(),randomUUID()),'INVALID_PLACE'],[[...initialItems,{...initialItems[0],id:randomUUID(),position:1,starts_at:'2026-10-24T07:00:00Z'}],'DUPLICATE_CHARGE'],[[{...initialItems[0],day_date:'2026-10-27'}],'OUTSIDE_TRIP']])await denied(()=>rpc('save_plan',[trip,4,JSON.stringify(payload),randomUUID()]),code);
  await admin();await db.query('update public.places set is_active=false where id=$1',[place]);await actor(E);await denied(()=>rpc('save_plan',[trip,4,JSON.stringify(initialItems),randomUUID()]),'INVALID_PLACE');await admin();await db.query('update public.places set is_active=true where id=$1',[place]);
 });
 await t.test('unknown opening hours and overlapping/closed schedule rejected',async()=>{
  await actor(E);await denied(()=>rpc('save_plan',[trip,4,JSON.stringify([{...initialItems[0],starts_at:'2026-10-24T01:00:00Z'}]),randomUUID()]),'CLOSED_OR_UNKNOWN_HOURS');
  await denied(()=>rpc('save_plan',[trip,4,JSON.stringify([...initialItems,{...items(randomUUID(),groupPlace)[0],position:1,starts_at:'2026-10-24T05:30:00Z'}]),randomUUID()]),'SCHEDULE_CONFLICT');
 });
 await t.test('forced failure after item updates rolls back items/version/proposal/idempotency',async()=>{
  await actor(E);const draft=await rpc('preview_plan',[trip,4,JSON.stringify(items()),randomUUID()]);
  await admin();await db.exec(`create function private.inject_failure() returns trigger language plpgsql as $$begin raise exception 'INJECTED_FAILURE';end$$; create trigger failure after update on public.trips for each row execute function private.inject_failure();`);
  await actor(E);await denied(()=>rpc('save_plan',[trip,4,'[]',randomUUID(),draft.proposal_id,true]),'INJECTED_FAILURE');
  assert.equal((await db.query('select version from public.trips where id=$1',[trip])).rows[0].version,4);
  assert.equal((await db.query('select id from public.plan_items where trip_id=$1',[trip])).rows[0].id,initialItems[0].id);
  assert.equal((await db.query('select status from public.ai_proposals where id=$1',[draft.proposal_id])).rows[0].status,'ready');
  await admin();await db.exec('drop trigger failure on public.trips; drop function private.inject_failure();');
 });
 await t.test('retained item vote survives a saved edit',async()=>{
  await actor(E);await rpc('cast_vote',[trip,initialItems[0].id,1,randomUUID()]);await rpc('save_plan',[trip,4,JSON.stringify(initialItems),randomUUID()]);assert.equal((await db.query('select count(*)::int n from public.votes where trip_id=$1',[trip])).rows[0].n,1);
 });
 await t.test('foreign item ID cannot be moved into another trip and rollback preserves originals',async()=>{
  await actor(X);const foreign=items();await rpc('save_plan',[tripB,0,JSON.stringify(foreign),randomUUID()]);
  await actor(E);await denied(()=>rpc('save_plan',[trip,5,JSON.stringify(foreign),randomUUID()]),'CROSS_TRIP_ITEM');
  assert.equal((await db.query('select id from public.plan_items where trip_id=$1',[trip])).rows[0].id,initialItems[0].id);
 });
 await t.test('changed place under existing item ID clears old-place votes atomically',async()=>{
  await actor(E);await rpc('save_plan',[trip,5,JSON.stringify(items(initialItems[0].id,groupPlace)),randomUUID()]);
  assert.equal((await db.query('select count(*)::int n from public.votes where trip_id=$1',[trip])).rows[0].n,0);
 });
 await t.test('removed member loses reads/writes/retry; consumed token cannot restore access',async()=>{
  await actor(O);await rpc('remove_participant',[trip,E]);await actor(E);assert.equal((await db.query('select * from public.trips where id=$1',[trip])).rows.length,0);
  await denied(()=>rpc('cast_vote',[trip,initialItems[0].id,1,randomUUID()]),'FORBIDDEN');await denied(()=>rpc('save_plan',[trip,6,JSON.stringify(initialItems),randomUUID()]),'FORBIDDEN');await denied(()=>rpc('accept_invitation',[token]),'INVITATION_CONSUMED');
 });
 await t.test('new invitation reactivates historical membership; ownership transfer stays singular',async()=>{
  await actor(O);const inv=await rpc('issue_invitation',[trip]);await actor(E);await rpc('accept_invitation',[inv.token]);await actor(O);await rpc('transfer_ownership',[trip,E]);
  const owners=(await db.query("select * from public.participants where trip_id=$1 and role='owner' and left_at is null",[trip])).rows;assert.equal(owners.length,1);assert.equal(owners[0].user_id,E);
 });
});
await db.close();
