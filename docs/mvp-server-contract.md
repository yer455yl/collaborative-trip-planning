# Proposed MVP Server and Client Contract

Author: Aman Yerassyl. Revision: 23 October 2026. Dependency: PR #10, head `5c18b07`. **Proposed, not accepted by teammates and not a deployed API.** This contract supports trip creation, initial route generation, planned budgeting, map display and collaborative editing/voting on Android/iOS/web. Deferred features remain in the retained schema.

## Data boundary

| Data | Proposed representation and authority |
| --- | --- |
| Actor | Verified Supabase Auth subject; never accept a body-supplied user/role as authorization |
| Trip input | `title`, `destination`, `start_date`, `end_date`, `travelers_count`, `trip_type`, `trip_interests`, `budget`, `currency`, `time_zone`; server allowlist and validation |
| Calendar dates | Strict existing `YYYY-MM-DD`, inclusive trip dates; reject impossible dates rather than normalize them. Scheduling uses explicit IANA `time_zone` |
| Travelers | Positive integer party size, independent of registered collaborator count; server loads persisted value for recalculation |
| Money | Decimal strings with at most two places for database/API `numeric(12,2)` values; KZT initially. Internal exact integer minor units, range 0–999999999999. Positive trip limit; unknown price remains null |
| Place identity | Canonical `places.id` UUID. Provider ID is a separate adapter mapping, never a replacement for the database UUID. Map receives catalog latitude/longitude; unknown/inactive place rejected |
| Raw price | Trusted catalog amount, `cost_unit`, quantity, currency, `source_url`, UTC `checked_at`; server owns eligibility and freshness. Timestamp is provenance, not a guaranteed current quote |
| Normalized estimate | `plan_items.estimated_cost` is the whole-party charge. Client adapter: `perGroup`, quantity 1. Never multiply it by travelers again. `estimate_basis` records raw price/unit, expanded quantity/dates, source and check time |
| Lodging/transport | Trusted adapter expands dated charges with explicit room/capacity/night rules; server-generated economic charge keys prevent the same charge being counted twice. Unsupported or missing assumptions block a complete verdict |
| Version | Nonnegative integer `trips.version`; one plan-wide optimistic version. Item version alone is insufficient for reorder or changed trip inputs |
| Retry identity | UUID `request_key` scoped to actor/trip/operation; payload fingerprint required. Same key with different content conflicts |
| Required categories | Server policy by trip type, never an arbitrary client list used as proof of completeness |

## Proposed command boundary

Names describe commands, not existing HTTP routes. Zukhra owns UI/serialization integration; Yerassyl owns trusted validation and database commands; Sayakhat owns shell/generation/maps integration, subject to team acceptance.

- Create trip: validate input, create trip plus one owner atomically, return trip ID/version. An existing user profile alone grants no membership.
- Generate draft: authenticated active member submits trip ID, request key and expected version. Server reloads constraints/catalog; provider output is untrusted. Store a private initial `ai_proposals` draft with base version, validation issues and expiry. No itinerary write on generation.
- Save manual edit: submit an allowlisted full replacement snapshot with IDs/day/order and `expected_version`/`request_key`; server rechecks all retained items and recalculates costs from trusted data. Client estimate is display-only. Custom unsourced charges cannot be presented as complete until a reviewed trusted pricing policy exists.
- Confirm initial draft: `{trip_id, proposal_id, expected_version, request_key, confirm: true}`. Explicit user action is required. No free-text conversational editor in MVP.
- Vote: `{trip_id, plan_item_id, value: -1|1, request_key}`. Actor comes from JWT. Upsert one `(plan_item_id,user_id)` current vote; withdrawal is an explicit delete. Define concurrent last-committed-write behavior and return authoritative tally.
- Invite: owner issues/revokes a random token; store only hash. Authenticated acceptance atomically consumes it and creates/reactivates membership. Same accepted recipient retry returns original membership; another recipient replay fails. Do not expose tokens in logs.

Success format proposal: `{request_key, trip_id, applied_version, item_ids, budget: {currency: "KZT", total: "7500.00", complete: true}, status: "committed"}`. Generation returns `status: "ready"`, `proposal_id`, `base_version`, `expires_at`, items and budget preview, never `committed`. An idempotent retry returns the original outcome/version even if the current trip has advanced; authorize the current actor before exposing it.

## Transaction and authorization

After token verification, lock the trip and relevant membership/invitation/proposal rows in a consistent order. Recheck active owner/editor membership under that lock; check expected version; reload eligible trusted prices and freshness; validate dates, ordering, schedule, IDs and independently calculated complete budget. Apply items, one version increment, proposal confirmation and idempotency result in **one** database transaction. Failure at any step leaves all unchanged. Revocation and saves use compatible locks, so no command authorized against a removed membership can commit after removal wins.

Direct table writes must not bypass these invariants; RLS and grants must be implemented/tested for Data API, RPC and subscriptions. Service-role credentials never reach clients. Realtime carries permitted committed change hints, not authoritative totals or durable delivery guarantees. Reconnect fetches complete current state/version; a stale command gets a conflict and user review, not silent overwrite. This is ordinary online recovery; queued offline editing remains deferred.

## Error envelope proposal

`{error: {code, message, field_errors?}, request_key?}`; stable codes, no SQL/provider/secret details. Proposed HTTP mapping: 400 malformed input (`INVALID_DATE`, `INVALID_MONEY`, `INVALID_INTEGER`); 401 invalid session; 403 forbidden actor/role; 404 absent or inaccessible trip/item using one consistent non-enumerating policy; 409 `VERSION_CONFLICT`, incompatible retry or consumed invitation; 422 `INCOMPLETE_ESTIMATE`, `STALE_PRICE`, `INVALID_PLACE`, `OUTSIDE_TRIP`, `OVER_BUDGET`; 503 controlled generation/provider failure. Current version is returned only to an authorized member. Teammates must confirm envelope, mapping and retry behavior before integration.

## Executable increment and limits

[planning-guard.mjs](../supabase/functions/_shared/planning-guard.mjs) is a dependency-free pure helper for a future Supabase trusted command, using standard JavaScript/BigInt. It validates a **trusted server snapshot**, including active membership fields, version, exact money, raw or normalized price units, provenance timestamp, basic place/date eligibility and declared mandatory categories. It performs no I/O and contains no credentials. Local Node tests are a test harness, not a new Node server architecture.

An HTTP caller must never supply the helper's membership, trip, prices, category policy or clock context. The helper does not verify JWT, execute RLS, implement invitations/votes, prove schedule feasibility, infer missing categories, persist or provide transactions. Its normalized-group path accepts only server-persisted/revalidated amounts and quantity 1. Full catalog/schedule adapters, SQL migrations, policies, RPCs and integration tests remain open. No Supabase project or deployment is claimed.

## Questions requiring replies

| Question | Requested reviewer | Status |
| --- | --- | --- |
| Trip field names, strict calendar parsing and decimal-string adapter to Dart | Zukhra and Sayakhat | Proposed; no acceptance recorded |
| Catalog UUID/provider mapping; raw cost-unit vocabulary and lodging/transport expansion | Sayakhat and Zukhra | Open |
| Mandatory cost categories, price maximum age and behavior when sources are missing/stale | All three | Open; tests inject a synthetic 24-hour policy, not an approved product threshold |
| Version granularity, complete replacement payload, errors and explicit confirmation response | Zukhra and Sayakhat | Proposed; no acceptance recorded |
| DIP-30 ownership transfer; DIP-32 generation/client-budget/server-budget split | All three | Open; no reassignment assumed |
| Platform acceptance and revised report/release version | All three | Android/iOS/web retained; release version not agreed |

No interface has been newly accepted by another participant during preparation of this document. Review requests and later replies must be linked as evidence; a proposed table is not agreement.

## Recorded follow-up 24 October 2026

The original proposal/open-question table above retains its 23 October context. [Zukhra’s reply](https://github.com/yer455yl/collaborative-trip-planning/pull/10#issuecomment-6381297635) accepts her client field/date/money/version/confirmation baseline and DIP-30/client-budget responsibilities. [Sayakhat’s reply](https://github.com/yer455yl/collaborative-trip-planning/pull/10#issuecomment-6381384816) accepts his shell/generation/map responsibilities and the split, while proposing adapter/category/charge-key details. This is partial role/interface evidence, not approval of every policy or deployed API. Price age/category policy, expansion/charge identity, complete payload validation and demonstration matrix remain open. See [integration review](reviews/submission-integration-24-october.md).
