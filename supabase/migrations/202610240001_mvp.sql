-- New empty test project only. No destructive drops; deferred logical tables remain in schema-design.json.
begin;
create schema if not exists private;
revoke all on schema private from public;
create table public.users (
 id uuid primary key references auth.users(id), display_name text not null check(length(trim(display_name)) between 1 and 100),
 preferred_language text not null default 'en' check(preferred_language in ('en','ru','kk')), created_at timestamptz not null default now()
);
create table public.trips (
 id uuid primary key default gen_random_uuid(), title text not null check(length(trim(title)) between 1 and 200),
 destination text not null check(length(trim(destination)) between 1 and 200), start_date date not null, end_date date not null,
 travelers_count integer not null check(travelers_count between 1 and 100), trip_type text not null,
 trip_interests text[] not null default '{}', budget numeric(12,2) not null check(budget>0), currency text not null default 'KZT' check(currency='KZT'),
 expenses_enabled boolean not null default false check(not expenses_enabled), time_zone text not null default 'Asia/Almaty',
 version integer not null default 0 check(version>=0), created_at timestamptz not null default now(), check(end_date>=start_date and end_date-start_date<=30)
);
create table public.participants (
 trip_id uuid not null references public.trips, user_id uuid not null references public.users,
 role text not null check(role in ('owner','editor')), joined_at timestamptz not null default now(), left_at timestamptz,
 primary key(trip_id,user_id)
);
create unique index one_active_owner on public.participants(trip_id) where role='owner' and left_at is null;
create index active_user_trips on public.participants(user_id,trip_id) where left_at is null;
create table public.places (
 id uuid primary key default gen_random_uuid(), name text not null, category text not null,
 latitude numeric not null check(latitude between -90 and 90), longitude numeric not null check(longitude between -180 and 180),
 address text not null, description text, is_indoor boolean, child_friendly boolean,
 opening_hours jsonb not null default '{}', time_zone text not null default 'Asia/Almaty',
 estimated_cost numeric(12,2) check(estimated_cost>=0), currency text not null default 'KZT', cost_unit text not null check(cost_unit in ('per_group','per_person')),
 duration_minutes integer check(duration_minutes between 1 and 1440), capacity_basis integer, cost_category text not null,
 source_url text not null, checked_at timestamptz, booking_url text, map_url text, is_active boolean not null default false
);
create table public.plan_items (
 id uuid primary key, trip_id uuid not null references public.trips, place_id uuid references public.places,
 event_id uuid check(event_id is null), added_by uuid not null, item_type text not null default 'place' check(item_type='place'),
 day_date date not null, position integer not null check(position>=0), title text not null, starts_at timestamptz not null,
 duration_minutes integer not null check(duration_minutes>0), estimated_cost numeric(12,2) not null check(estimated_cost>=0),
 cost_category text not null, estimate_basis jsonb not null, version integer not null,
 unique(trip_id,id), unique(trip_id,day_date,position), foreign key(trip_id,added_by) references public.participants
);
create table public.votes (
 plan_item_id uuid not null, user_id uuid not null, trip_id uuid not null, value smallint not null check(value in (-1,1)),
 created_at timestamptz not null default now(), primary key(plan_item_id,user_id),
 foreign key(trip_id,plan_item_id) references public.plan_items(trip_id,id) on delete cascade,
 foreign key(trip_id,user_id) references public.participants
);
create table public.invitations (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips, created_by uuid not null,
 token_hash text not null unique, role text not null default 'editor' check(role='editor'), expires_at timestamptz not null,
 revoked_at timestamptz, accepted_by uuid references public.users, accepted_at timestamptz, created_at timestamptz not null default now(),
 foreign key(trip_id,created_by) references public.participants, check((accepted_by is null)=(accepted_at is null))
);
create table public.ai_proposals (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips, requested_by uuid not null,
 base_version integer not null, request_key uuid not null, proposed_items jsonb not null,
 cost_breakdown jsonb not null, validation_errors jsonb not null default '[]', status text not null check(status in ('ready','confirmed','rejected','expired','invalid','failed','pending')),
 expires_at timestamptz not null, created_at timestamptz not null default now(), confirmed_by uuid, confirmed_at timestamptz, applied_version integer,
 unique(trip_id,requested_by,request_key), foreign key(trip_id,requested_by) references public.participants,
 foreign key(trip_id,confirmed_by) references public.participants
);
-- Private operational metadata; not extra application-domain features.
create table private.command_results (actor uuid not null, operation text not null, request_key uuid not null, payload jsonb not null, result jsonb not null, primary key(actor,operation,request_key));
create table private.budget_policies (
 trip_type text primary key, required_categories text[] not null check(cardinality(required_categories)>0),
 max_price_age interval not null check(max_price_age>interval '0'), transfer_minutes integer not null check(transfer_minutes>=0),
 approved boolean not null default false
);
-- No default approved pricing/transfer policy: a real catalog and reviewed policy must be provisioned by an administrator.
create function private.member(p_trip uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.participants where trip_id=p_trip and user_id=auth.uid() and left_at is null)
$$;
create function private.lock_member(p_trip uuid, p_owner boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); role_value text;
begin
 if actor is null then raise exception 'UNAUTHENTICATED' using errcode='28000'; end if;
 perform 1 from public.trips where id=p_trip for update;
 select role into role_value from public.participants where trip_id=p_trip and user_id=actor and left_at is null;
 if role_value is null or (p_owner and role_value<>'owner') then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 return actor;
end $$;
create function private.replay(p_operation text,p_key uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare saved private.command_results;
begin
 if p_key is null then raise exception 'INVALID_REQUEST_KEY'; end if;
 -- Serializes identical actor/operation/key retries, including create-trip before a trip exists.
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_operation||p_key::text,0));
 select * into saved from private.command_results where actor=auth.uid() and operation=p_operation and request_key=p_key;
 if found then
  if saved.payload<>p_payload then raise exception 'IDEMPOTENCY_CONFLICT' using errcode='40001'; end if;
  return saved.result;
 end if;
 return null;
end $$;
create function private.remember(p_operation text,p_key uuid,p_payload jsonb,p_result jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 insert into private.command_results values(auth.uid(),p_operation,p_key,p_payload,p_result); return p_result;
end $$;
create function public.upsert_profile(p_display_name text,p_language text default 'en') returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED' using errcode='28000'; end if;
 insert into public.users(id,display_name,preferred_language) values(auth.uid(),p_display_name,p_language)
 on conflict(id) do update set display_name=excluded.display_name,preferred_language=excluded.preferred_language;
end $$;
create function public.create_trip(p_input jsonb,p_request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare trip uuid; result jsonb; d1 date; d2 date;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED' using errcode='28000'; end if;
 result:=private.replay('create_trip',p_request_key,p_input); if result is not null then return result; end if;
 if p_input->>'start_date' !~ '^\d{4}-\d{2}-\d{2}$' or p_input->>'end_date' !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'INVALID_DATE'; end if;
 d1:=(p_input->>'start_date')::date; d2:=(p_input->>'end_date')::date;
 if p_input->>'budget' !~ '^\d+(\.\d{1,2})?$' then raise exception 'INVALID_MONEY'; end if;
 if not exists(select 1 from pg_timezone_names where name=coalesce(p_input->>'time_zone','Asia/Almaty')) then raise exception 'INVALID_TIME_ZONE'; end if;
 insert into public.trips(title,destination,start_date,end_date,travelers_count,trip_type,trip_interests,budget,currency,time_zone)
 values(p_input->>'title',p_input->>'destination',d1,d2,(p_input->>'travelers_count')::integer,p_input->>'trip_type',
 array(select jsonb_array_elements_text(coalesce(p_input->'trip_interests','[]'))),(p_input->>'budget')::numeric,
 coalesce(p_input->>'currency','KZT'),coalesce(p_input->>'time_zone','Asia/Almaty')) returning id into trip;
 insert into public.participants(trip_id,user_id,role) values(trip,auth.uid(),'owner');
 return private.remember('create_trip',p_request_key,p_input,jsonb_build_object('trip_id',trip,'applied_version',0,'status','committed'));
end $$;
create function public.issue_invitation(p_trip uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid; token text:=gen_random_uuid()::text||gen_random_uuid()::text; inv uuid;
begin
 actor:=private.lock_member(p_trip,true);
 insert into public.invitations(trip_id,created_by,token_hash,expires_at) values(p_trip,actor,encode(sha256(convert_to(token,'UTF8')),'hex'),now()+interval '1 day') returning id into inv;
 return jsonb_build_object('invitation_id',inv,'token',token,'expires_at',now()+interval '1 day');
end $$;
create function public.accept_invitation(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare inv public.invitations;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED' using errcode='28000'; end if;
 select * into inv from public.invitations where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex');
 if not found then raise exception 'INVALID_INVITATION'; end if;
 perform 1 from public.trips where id=inv.trip_id for update;
 select * into inv from public.invitations where id=inv.id for update;
 if inv.revoked_at is not null or inv.expires_at<=now() then raise exception 'INVALID_INVITATION'; end if;
 if inv.accepted_by is not null then
  if inv.accepted_by<>auth.uid() or not private.member(inv.trip_id) then raise exception 'INVITATION_CONSUMED'; end if;
  return jsonb_build_object('trip_id',inv.trip_id,'role','editor','status','accepted');
 end if;
 if exists(select 1 from public.participants where trip_id=inv.trip_id and user_id=auth.uid() and role='owner') then raise exception 'ALREADY_OWNER'; end if;
 insert into public.participants(trip_id,user_id,role) values(inv.trip_id,auth.uid(),'editor')
 on conflict(trip_id,user_id) do update set left_at=null,role='editor',joined_at=now();
 update public.invitations set accepted_by=auth.uid(),accepted_at=now() where id=inv.id;
 return jsonb_build_object('trip_id',inv.trip_id,'role','editor','status','accepted');
end $$;
create function public.revoke_invitation(p_trip uuid,p_invitation uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.lock_member(p_trip,true);
 update public.invitations set revoked_at=now() where id=p_invitation and trip_id=p_trip;
 if not found then raise exception 'NOT_FOUND'; end if;
end $$;
create function public.remove_participant(p_trip uuid,p_user uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.lock_member(p_trip,true);
 if exists(select 1 from public.participants where trip_id=p_trip and user_id=p_user and role='owner' and left_at is null) then raise exception 'LAST_OWNER'; end if;
 update public.participants set left_at=now() where trip_id=p_trip and user_id=p_user;
end $$;
create function public.transfer_ownership(p_trip uuid,p_user uuid) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=private.lock_member(p_trip,true);
 if p_user=actor or not exists(select 1 from public.participants where trip_id=p_trip and user_id=p_user and left_at is null) then raise exception 'INVALID_MEMBER'; end if;
 update public.participants set role='editor' where trip_id=p_trip and user_id=actor;
 update public.participants set role='owner' where trip_id=p_trip and user_id=p_user;
end $$;
-- Validates catalog references and independently prices normalized group costs. No caller amount is accepted.
create function private.validate_plan(p_trip uuid,p_items jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare t public.trips; policy private.budget_policies; item jsonb; place public.places; amount numeric; total numeric:=0;
 normalized jsonb:='[]'; cats text[]:='{}'; ids uuid[]:='{}'; charges text[]:='{}'; day date; pos integer; start_time timestamptz; finish_time timestamptz;
 local_start timestamp; local_end timestamp; windows jsonb; w jsonb; open_ok boolean; previous_finish timestamptz; previous_day date;
 charge text; last_pos integer:=-1; item_id uuid;
begin
 select * into t from public.trips where id=p_trip;
 select * into policy from private.budget_policies where trip_type=t.trip_type and approved;
 if not found then raise exception 'BUDGET_POLICY_NOT_CONFIGURED'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 200 then raise exception 'INVALID_ITEMS'; end if;
 for item in select value from jsonb_array_elements(p_items) loop
  if item->>'day_date' !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'INVALID_DATE'; end if;
  day:=(item->>'day_date')::date; pos:=(item->>'position')::integer; item_id:=(item->>'id')::uuid;
  if item_id is null or item_id=any(ids) then raise exception 'DUPLICATE_ITEM'; end if; ids:=array_append(ids,item_id);
  if day<t.start_date or day>t.end_date then raise exception 'OUTSIDE_TRIP'; end if;
  if pos is null or pos not between 0 and 199 or (previous_day=day and pos<=last_pos) or day<previous_day then raise exception 'INVALID_ORDER'; end if;
  select * into place from public.places where id=(item->>'place_id')::uuid and is_active for share;
  if not found then raise exception 'INVALID_PLACE'; end if;
  if place.estimated_cost is null or place.currency<>t.currency or trim(place.source_url)='' or place.checked_at is null then raise exception 'INCOMPLETE_ESTIMATE'; end if;
  if place.checked_at>now() or now()-place.checked_at>policy.max_price_age then raise exception 'STALE_PRICE'; end if;
  if place.duration_minutes is null then raise exception 'INCOMPLETE_SCHEDULE'; end if;
  if place.time_zone<>t.time_zone then raise exception 'TIME_ZONE_MISMATCH'; end if;
  if item->>'starts_at' !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$' then raise exception 'INVALID_TIME'; end if;
  start_time:=(item->>'starts_at')::timestamptz;
  if start_time is null then raise exception 'INVALID_TIME'; end if;
  finish_time:=start_time+make_interval(mins=>place.duration_minutes);
  local_start:=start_time at time zone t.time_zone; local_end:=finish_time at time zone t.time_zone;
  if local_start::date<>day or local_end::date<>day then raise exception 'INVALID_TIME'; end if;
  if previous_day=day and start_time<previous_finish+make_interval(mins=>policy.transfer_minutes) then raise exception 'SCHEDULE_CONFLICT'; end if;
  windows:=place.opening_hours->(extract(isodow from day)::integer::text); open_ok:=false;
  if jsonb_typeof(windows)='array' then
   for w in select value from jsonb_array_elements(windows) loop
    if local_start::time>=(w->>'open')::time and local_end::time<=(w->>'close')::time then open_ok:=true; end if;
   end loop;
  end if;
  if not open_ok then raise exception 'CLOSED_OR_UNKNOWN_HOURS'; end if;
  charge:=place.id::text||':'||day::text;
  if charge=any(charges) then raise exception 'DUPLICATE_CHARGE'; end if; charges:=array_append(charges,charge);
  amount:=place.estimated_cost*case when place.cost_unit='per_person' then t.travelers_count else 1 end;
  if amount>9999999999.99 or total+amount>9999999999.99 then raise exception 'MONEY_OVERFLOW'; end if;
  total:=total+amount; cats:=array_append(cats,place.cost_category);
  normalized:=normalized||jsonb_build_array(jsonb_build_object('id',item_id,'place_id',place.id,'day_date',day,'position',pos,
   'title',place.name,'starts_at',start_time,'duration_minutes',place.duration_minutes,'estimated_cost',amount::text,'cost_category',place.cost_category,
   'estimate_basis',jsonb_build_object('raw_price',place.estimated_cost::text,'currency',place.currency,'unit',place.cost_unit,'quantity',1,'travelers',t.travelers_count,'source_url',place.source_url,'checked_at',place.checked_at,'charge_key',charge)));
  previous_finish:=finish_time; previous_day:=day; last_pos:=pos;
 end loop;
 if not policy.required_categories<@cats then raise exception 'INCOMPLETE_ESTIMATE'; end if;
 if total>t.budget then raise exception 'OVER_BUDGET'; end if;
 return jsonb_build_object('items',normalized,'budget',jsonb_build_object('currency',t.currency,'total',total::text,'remaining',(t.budget-total)::text,'complete',true));
end $$;
create function public.preview_plan(p_trip uuid,p_expected_version integer,p_items jsonb,p_request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid; payload jsonb:=jsonb_build_object('trip_id',p_trip,'version',p_expected_version,'items',p_items); prior jsonb; checked jsonb; proposal uuid;
begin
 actor:=private.lock_member(p_trip); prior:=private.replay('preview_plan',p_request_key,payload); if prior is not null then return prior; end if;
 if p_expected_version is distinct from (select version from public.trips where id=p_trip) then raise exception 'VERSION_CONFLICT' using errcode='40001'; end if;
 checked:=private.validate_plan(p_trip,p_items);
 insert into public.ai_proposals(trip_id,requested_by,base_version,request_key,proposed_items,cost_breakdown,status,expires_at)
 values(p_trip,actor,p_expected_version,p_request_key,p_items,checked->'budget','ready',now()+interval '30 minutes') returning id into proposal;
 return private.remember('preview_plan',p_request_key,payload,jsonb_build_object('proposal_id',proposal,'base_version',p_expected_version,'status','ready','items',checked->'items','budget',checked->'budget','expires_at',now()+interval '30 minutes'));
end $$;
-- One implementation for manual replacement and explicit proposal confirmation. Both revalidate inside the same transaction.
create function public.save_plan(p_trip uuid,p_expected_version integer,p_items jsonb,p_request_key uuid,p_proposal uuid default null,p_confirm boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid; payload jsonb:=jsonb_build_object('trip_id',p_trip,'version',p_expected_version,'items',p_items,'proposal',p_proposal,'confirm',p_confirm);
 prior jsonb; proposal public.ai_proposals; checked jsonb; item jsonb; new_version integer; final_items jsonb; item_ids jsonb;
begin
 actor:=private.lock_member(p_trip); prior:=private.replay('save_plan',p_request_key,payload); if prior is not null then return prior; end if;
 if p_expected_version is distinct from (select version from public.trips where id=p_trip) then raise exception 'VERSION_CONFLICT' using errcode='40001'; end if;
 final_items:=p_items;
 if p_proposal is not null then
  select * into proposal from public.ai_proposals where id=p_proposal and trip_id=p_trip for update;
  if not found or proposal.status<>'ready' or proposal.expires_at<=now() or proposal.base_version<>p_expected_version or p_confirm is not true then raise exception 'INVALID_PROPOSAL'; end if;
  final_items:=proposal.proposed_items;
 end if;
 checked:=private.validate_plan(p_trip,final_items); new_version:=p_expected_version+1;
 -- Preserve votes on retained IDs; remove votes only for deleted items.
 delete from public.plan_items where trip_id=p_trip and id not in(select (value->>'id')::uuid from jsonb_array_elements(checked->'items'));
 -- Replacement at an existing ID invalidates votes for the old place.
 delete from public.votes v using public.plan_items old where v.plan_item_id=old.id and old.trip_id=p_trip
 and exists(select 1 from jsonb_array_elements(checked->'items') x where (x->>'id')::uuid=old.id and (x->>'place_id')::uuid<>old.place_id);
 -- Temporarily shift retained ordering to avoid unique collisions during a valid reorder.
 update public.plan_items set position=position+1000000 where trip_id=p_trip;
 for item in select value from jsonb_array_elements(checked->'items') loop
  if exists(select 1 from public.plan_items where id=(item->>'id')::uuid and trip_id<>p_trip) then raise exception 'CROSS_TRIP_ITEM'; end if;
  insert into public.plan_items(id,trip_id,place_id,added_by,day_date,position,title,starts_at,duration_minutes,estimated_cost,cost_category,estimate_basis,version)
  values((item->>'id')::uuid,p_trip,(item->>'place_id')::uuid,actor,(item->>'day_date')::date,(item->>'position')::integer,item->>'title',(item->>'starts_at')::timestamptz,
   (item->>'duration_minutes')::integer,(item->>'estimated_cost')::numeric,item->>'cost_category',item->'estimate_basis',new_version)
  on conflict(id) do update set place_id=excluded.place_id,day_date=excluded.day_date,position=excluded.position,title=excluded.title,starts_at=excluded.starts_at,
   duration_minutes=excluded.duration_minutes,estimated_cost=excluded.estimated_cost,cost_category=excluded.cost_category,estimate_basis=excluded.estimate_basis,version=excluded.version;
 end loop;
 update public.trips set version=new_version where id=p_trip;
 if p_proposal is not null then update public.ai_proposals set status='confirmed',confirmed_by=actor,confirmed_at=now(),applied_version=new_version where id=p_proposal; end if;
 select jsonb_agg(value->'id') into item_ids from jsonb_array_elements(checked->'items');
 return private.remember('save_plan',p_request_key,payload,jsonb_build_object('trip_id',p_trip,'request_key',p_request_key,'applied_version',new_version,'status','committed','item_ids',item_ids,'budget',checked->'budget'));
end $$;
create function public.cast_vote(p_trip uuid,p_item uuid,p_value smallint,p_request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid; payload jsonb:=jsonb_build_object('trip_id',p_trip,'item_id',p_item,'value',p_value); prior jsonb; tally integer;
begin
 actor:=private.lock_member(p_trip); prior:=private.replay('cast_vote',p_request_key,payload); if prior is not null then return prior; end if;
 if not exists(select 1 from public.plan_items where id=p_item and trip_id=p_trip) then raise exception 'INVALID_ITEM'; end if;
 if p_value is null then delete from public.votes where plan_item_id=p_item and user_id=actor;
 else insert into public.votes(plan_item_id,trip_id,user_id,value) values(p_item,p_trip,actor,p_value)
 on conflict(plan_item_id,user_id) do update set value=excluded.value,created_at=now(); end if;
 select coalesce(sum(v.value),0) into tally from public.votes v join public.participants p on p.trip_id=v.trip_id and p.user_id=v.user_id where v.plan_item_id=p_item and p.left_at is null;
 return private.remember('cast_vote',p_request_key,payload,jsonb_build_object('item_id',p_item,'tally',tally));
end $$;
create function public.get_trip_snapshot(p_trip uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform private.lock_member(p_trip);
 return jsonb_build_object(
  'trip',(select to_jsonb(t) from public.trips t where id=p_trip),
  'items',(select coalesce(jsonb_agg(to_jsonb(i) order by i.day_date,i.position),'[]') from public.plan_items i where i.trip_id=p_trip),
  'votes',(select coalesce(jsonb_agg(to_jsonb(v)),'[]') from public.votes v join public.participants p on p.trip_id=v.trip_id and p.user_id=v.user_id where v.trip_id=p_trip and p.left_at is null),
  'participants',(select coalesce(jsonb_agg(jsonb_build_object('user_id',p.user_id,'role',p.role,'display_name',u.display_name)),'[]') from public.participants p join public.users u on u.id=p.user_id where p.trip_id=p_trip and p.left_at is null));
end $$;
create function public.existing_preview(p_trip uuid,p_request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 perform private.lock_member(p_trip);
 select r.result into result from private.command_results r where r.actor=auth.uid() and r.operation='preview_plan' and r.request_key=p_request_key and r.payload->>'trip_id'=p_trip::text;
 return result;
end $$;
create function public.planning_context(p_trip uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform private.lock_member(p_trip);
 return jsonb_build_object('trip',(select to_jsonb(t) from public.trips t where id=p_trip),'places',(select coalesce(jsonb_agg(to_jsonb(p)),'[]') from (select * from public.places where is_active order by id limit 200) p));
end $$;
-- No client writes to invariant-bearing tables. RPC functions explicitly authorize every actor.
do $$ declare name text; begin
 foreach name in array array['users','trips','participants','places','plan_items','votes','invitations','ai_proposals'] loop
 execute format('alter table public.%I enable row level security',name);
 execute format('revoke all on public.%I from anon, authenticated',name);
 end loop;
end $$;
grant select on public.users,public.trips,public.participants,public.places,public.plan_items,public.votes,public.ai_proposals to authenticated;
create policy self_profile on public.users for select to authenticated using(id=auth.uid());
create policy member_trip on public.trips for select to authenticated using(private.member(id));
create policy member_participants on public.participants for select to authenticated using(private.member(trip_id));
create policy catalog_read on public.places for select to authenticated using(is_active);
create policy member_items on public.plan_items for select to authenticated using(private.member(trip_id));
create policy member_votes on public.votes for select to authenticated using(private.member(trip_id) and exists(select 1 from public.participants p where p.trip_id=votes.trip_id and p.user_id=votes.user_id and p.left_at is null));
create policy member_proposals on public.ai_proposals for select to authenticated using(private.member(trip_id));
revoke all on all tables in schema private from public,anon,authenticated;
revoke execute on all functions in schema private from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.member(uuid) to authenticated;
-- Explicit list avoids altering unrelated project functions/grants.
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname=any(array['upsert_profile','create_trip','issue_invitation','accept_invitation','revoke_invitation','remove_participant','transfer_ownership','preview_plan','save_plan','cast_vote','planning_context','existing_preview','get_trip_snapshot']) loop
 execute 'revoke all on function '||f.signature||' from public,anon,authenticated';
 execute 'grant execute on function '||f.signature||' to authenticated';
 end loop;
end $$;
commit;
