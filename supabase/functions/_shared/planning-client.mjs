/** Framework-independent online adapter. A Flutter adapter must mirror this wire contract. */
export function planningClient({endpoint,publicKey,getAccessToken,fetchImpl=fetch}){
 if(!/^https:\/\//.test(endpoint))throw new Error('HTTPS endpoint required');
 return {
  async command(command,args){
   const token=await getAccessToken();if(!token)throw Object.assign(new Error('UNAUTHENTICATED'),{code:'UNAUTHENTICATED'});
   const response=await fetchImpl(endpoint,{method:'POST',headers:{Authorization:`Bearer ${token}`,apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify({command,args}),signal:AbortSignal.timeout(30000)});
   const result=await response.json();if(!response.ok)throw Object.assign(new Error(result.error?.code??'UPSTREAM_ERROR'),{code:result.error?.code,status:response.status});return result;
  },
  async snapshot(tripId){return this.command('get_trip_snapshot',{p_trip:tripId});},
  async save({tripId,expectedVersion,items,requestKey,proposalId=null,confirm=false}){
   // Caller retains requestKey when retrying; a stale version is surfaced, never silently merged.
   return this.command('save_plan',{p_trip:tripId,p_expected_version:expectedVersion,p_items:items,p_request_key:requestKey,p_proposal:proposalId,p_confirm:confirm});
  }
 };
}
