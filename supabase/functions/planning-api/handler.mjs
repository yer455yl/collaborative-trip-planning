/** Web-standard handler. The Supabase runtime adapter injects configuration; no secrets in client responses. */
const COMMANDS={
 upsert_profile:['p_display_name','p_language'],create_trip:['p_input','p_request_key'],
 issue_invitation:['p_trip'],accept_invitation:['p_token'],revoke_invitation:['p_trip','p_invitation'],
 remove_participant:['p_trip','p_user'],transfer_ownership:['p_trip','p_user'],
 preview_plan:['p_trip','p_expected_version','p_items','p_request_key'],
 save_plan:['p_trip','p_expected_version','p_items','p_request_key','p_proposal','p_confirm'],
 cast_vote:['p_trip','p_item','p_value','p_request_key'],planning_context:['p_trip'],get_trip_snapshot:['p_trip']
};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KNOWN_CODES=new Set(['UNAUTHENTICATED','FORBIDDEN','INVALID_DATE','INVALID_MONEY','INVALID_TIME_ZONE','INVALID_REQUEST_KEY','IDEMPOTENCY_CONFLICT','INVALID_INVITATION','INVITATION_CONSUMED','ALREADY_OWNER','NOT_FOUND','LAST_OWNER','INVALID_MEMBER','BUDGET_POLICY_NOT_CONFIGURED','INVALID_ITEMS','DUPLICATE_ITEM','OUTSIDE_TRIP','INVALID_ORDER','INVALID_PLACE','INCOMPLETE_ESTIMATE','STALE_PRICE','INCOMPLETE_SCHEDULE','TIME_ZONE_MISMATCH','INVALID_TIME','SCHEDULE_CONFLICT','CLOSED_OR_UNKNOWN_HOURS','DUPLICATE_CHARGE','MONEY_OVERFLOW','OVER_BUDGET','VERSION_CONFLICT','INVALID_PROPOSAL','CROSS_TRIP_ITEM','INVALID_ITEM']);
function publicError(data){
 const code=KNOWN_CODES.has(data?.message)?data.message:({ '23502':'INVALID_INPUT','23503':'INVALID_REFERENCE','23505':'CONFLICT','23514':'INVALID_INPUT','22007':'INVALID_DATE','22008':'INVALID_DATE','22P02':'INVALID_INPUT','22003':'INVALID_INPUT','42501':'FORBIDDEN' }[data?.code]??'SERVER_ERROR');
 const status=code==='UNAUTHENTICATED'?401:code==='FORBIDDEN'?403:['VERSION_CONFLICT','IDEMPOTENCY_CONFLICT','INVITATION_CONSUMED','CONFLICT'].includes(code)?409:code==='SERVER_ERROR'?500:code==='BUDGET_POLICY_NOT_CONFIGURED'?503:422;
 return {code,status};
}
export function createPlanningHandler({supabaseUrl,anonKey,allowedOrigins=[],plannerUrl,plannerKey,fetchImpl=fetch,timeoutMs=25000}){
 // Configuration is server-owned. No service-role key is used; PostgREST sees the caller's JWT.
 if(!/^https:\/\//.test(supabaseUrl??'')||!anonKey)throw new Error('Missing Supabase configuration');
 return async function handle(request){
  const origin=request.headers.get('origin');
  const cors=origin&&allowedOrigins.includes(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'}:{};
  const respond=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...cors}});
  if(origin&&!allowedOrigins.includes(origin))return respond({error:{code:'ORIGIN_DENIED'}},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return respond({error:{code:'METHOD_NOT_ALLOWED'}},405);
  const authorization=request.headers.get('authorization');
  if(!/^Bearer [^\s]+$/.test(authorization??''))return respond({error:{code:'UNAUTHENTICATED'}},401);
  if(!(request.headers.get('content-type')??'').startsWith('application/json'))return respond({error:{code:'INVALID_CONTENT_TYPE'}},415);
  // Bound actual stream size rather than trusting Content-Length.
  let size=0, chunks=[];const reader=request.body?.getReader();
  if(!reader)return respond({error:{code:'INVALID_INPUT'}},400);
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>128*1024){await reader.cancel();return respond({error:{code:'PAYLOAD_TOO_LARGE'}},413);}chunks.push(value);}}catch{return respond({error:{code:'INVALID_INPUT'}},400);}
  const raw=new Uint8Array(size);let offset=0;for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.byteLength;}
  let body;try{body=JSON.parse(new TextDecoder().decode(raw));}catch{return respond({error:{code:'INVALID_JSON'}},400);}
  if(!body||typeof body!=='object'||Array.isArray(body)||!body.args||typeof body.args!=='object'||Array.isArray(body.args))return respond({error:{code:'INVALID_INPUT'}},400);
  const {command,args}=body;
  if(command!=='generate_plan'&&!Object.hasOwn(COMMANDS,command))return respond({error:{code:'UNKNOWN_COMMAND'}},400);
  const allowed=command==='generate_plan'?['p_trip','p_expected_version','p_request_key']:COMMANDS[command];
  if(Object.keys(args).some(key=>!allowed.includes(key)))return respond({error:{code:'UNKNOWN_ARGUMENT'}},400);
  for(const [key,value]of Object.entries(args))if(['p_trip','p_user','p_invitation','p_item','p_request_key','p_proposal'].includes(key)&&value!==null&&!UUID.test(value))return respond({error:{code:'INVALID_ID'}},400);
  const rpc=async(name,params)=>{
   const res=await fetchImpl(`${supabaseUrl}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:anonKey,Authorization:authorization,'Content-Type':'application/json'},body:JSON.stringify(params),signal:AbortSignal.timeout(timeoutMs)});
   let data;try{data=await res.json();}catch{throw {status:502,code:'UPSTREAM_ERROR'};}
   if(!res.ok){if(res.status===401)throw {status:401,code:'UNAUTHENTICATED'};throw publicError(data);}return data;
  };
  try{
   if(command!=='generate_plan')return respond(await rpc(command,args));
   // Authorization and successful retry lookup happen before any planner/provider call.
   const prior=await rpc('existing_preview',{p_trip:args.p_trip,p_request_key:args.p_request_key});
   if(prior){if(prior.base_version!==args.p_expected_version)return respond({error:{code:'IDEMPOTENCY_CONFLICT'}},409);return respond(prior);}
   const context=await rpc('planning_context',{p_trip:args.p_trip});
   if(context.trip.version!==args.p_expected_version)return respond({error:{code:'VERSION_CONFLICT'}},409);
   if(!plannerUrl||!/^https:\/\//.test(plannerUrl)||!plannerKey)return respond({error:{code:'PLANNER_NOT_CONFIGURED'}},503);
   const response=await fetchImpl(plannerUrl,{method:'POST',headers:{Authorization:`Bearer ${plannerKey}`,'Content-Type':'application/json'},body:JSON.stringify({trip:context.trip,places:context.places}),signal:AbortSignal.timeout(timeoutMs)});
   if(!response.ok)return respond({error:{code:'PLANNER_UNAVAILABLE'}},503);
   // Provider response remains untrusted and must pass the transactional validator.
   const result=await response.json();
   if(!Array.isArray(result.items)||result.items.length>200)return respond({error:{code:'INVALID_PLANNER_OUTPUT'}},502);
   return respond(await rpc('preview_plan',{...args,p_items:result.items}));
  }catch(error){return respond({error:{code:error?.code??'UPSTREAM_UNAVAILABLE'}},Number.isInteger(error?.status)?error.status:503);}
 };
}
