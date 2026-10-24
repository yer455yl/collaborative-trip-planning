// CI-only disposable native PostgreSQL. Run after database.test.mjs against the same local test database.
import {test} from 'node:test';import assert from 'node:assert/strict';import {Client}from'pg';import{randomUUID}from'node:crypto';
const url=new URL(process.env.TEST_DATABASE_URL??'http://invalid');
if(!['localhost','127.0.0.1'].includes(url.hostname)||process.env.ALLOW_DATABASE_TEST_STUBS!=='1')throw new Error('Disposable localhost PostgreSQL required');
const connect=async()=>{const c=new Client({connectionString:process.env.TEST_DATABASE_URL});await c.connect();return c;};
const admin=await connect();
const trip=(await admin.query('select trip_id from public.participants where left_at is null group by trip_id having count(*)=2')).rows[0].trip_id;
const members=(await admin.query('select user_id,role from public.participants where trip_id=$1 and left_at is null',[trip])).rows;
const owner=members.find(x=>x.role==='owner').user_id,editor=members.find(x=>x.role==='editor').user_id;
const item=(await admin.query('select to_jsonb(p) item from public.plan_items p where trip_id=$1',[trip])).rows[0].item;
const prepare=async(c,actor)=>{await c.query('begin');await c.query("select set_config('request.jwt.claim.sub',$1,true)",[actor]);await c.query('set local role authenticated');};
await test('native concurrent editors: exactly one expected-version update commits',async()=>{
 const a=await connect(),b=await connect();try{
  const version=(await admin.query('select version from public.trips where id=$1',[trip])).rows[0].version;
  await prepare(a,owner);await prepare(b,editor);
  await a.query('select public.save_plan($1,$2,$3,$4)',[trip,version,JSON.stringify([item]),randomUUID()]);
  const second=b.query('select public.save_plan($1,$2,$3,$4)',[trip,version,JSON.stringify([item]),randomUUID()]).then(()=>null,error=>error);
  await a.query('commit');assert.match((await second).message,/VERSION_CONFLICT/);await b.query('rollback');
  assert.equal((await admin.query('select version from public.trips where id=$1',[trip])).rows[0].version,version+1);
 }finally{await a.end();await b.end();}
});
await test('native concurrent invitation recipients: one token grants one membership',async()=>{
 const a=await connect(),b=await connect(),issuer=await connect();try{
  const outsiders=(await admin.query('select id from public.users where id not in($1,$2)',[owner,editor])).rows.map(x=>x.id);
  await prepare(issuer,owner);const token=(await issuer.query('select public.issue_invitation($1) result',[trip])).rows[0].result.token;await issuer.query('commit');
  await prepare(a,outsiders[0]);await prepare(b,outsiders[1]);await a.query('select public.accept_invitation($1)',[token]);
  const second=b.query('select public.accept_invitation($1)',[token]).then(()=>null,error=>error);await a.query('commit');assert.match((await second).message,/INVITATION_CONSUMED/);await b.query('rollback');
  assert.equal((await admin.query('select count(*)::int n from public.participants where trip_id=$1 and user_id=any($2::uuid[]) and left_at is null',[trip,outsiders])).rows[0].n,1);
 }finally{await a.end();await b.end();await issuer.end();}
});
await test('native removal/save race: removal winning trip lock prevents later editor commit',async()=>{
 const a=await connect(),b=await connect();try{
  const version=(await admin.query('select version from public.trips where id=$1',[trip])).rows[0].version;
  await prepare(a,owner);await prepare(b,editor);await a.query('select public.remove_participant($1,$2)',[trip,editor]);
  const save=b.query('select public.save_plan($1,$2,$3,$4)',[trip,version,JSON.stringify([item]),randomUUID()]).then(()=>null,error=>error);
  await a.query('commit');assert.match((await save).message,/FORBIDDEN/);await b.query('rollback');
  assert.equal((await admin.query('select version from public.trips where id=$1',[trip])).rows[0].version,version);
 }finally{await a.end();await b.end();}
});
await admin.end();
