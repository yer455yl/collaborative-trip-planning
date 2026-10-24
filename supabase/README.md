# MVP backend implementation

Revision: 24 October 2026. Owner: Aman Yerassyl. Task: DIP-28, with DIP-27/Auth and DIP-31/API integration boundaries. This implements a reviewable local backend increment; **no hosted project has been created or deployed**.

## What is executable

- One transactional migration creates eight MVP tables, keys, indexes and RLS. The other seven logical tables remain intact in `config/schema-design.json` as deferred designs; they are not deleted or exposed by this migration.
- RPC operations implement profile setup, atomic trip/owner creation, invitations/revocation/acceptance, participant removal, ownership transfer, trusted budget/schedule preview, versioned save/confirmation, one current vote/withdrawal and authorized generation context.
- Private operation-result records provide payload-bound retries, unique per actor/operation/key; the trip ID is part of the bound payload. Do not reuse a key for another trip. Commands serialize on the trip; invitation acceptance and revocation use the same lock order. Service-role client access is never used.
- The Edge adapter exposes an allowlisted command handler. PostgREST receives the caller's JWT. Provider requests run only after authorized context reads, and returned candidates pass SQL validation before a ready draft is returned. Confirmation is a separate command.

`get_trip_snapshot` returns trip/version, ordered items, active-member votes and member display names under the same trip lock; clients should reload this authoritative snapshot after changes or reconnection. The framework-independent `planning-client.mjs` demonstrates the wire contract, not a completed Flutter integration.

The SQL functions run with narrowly granted execution and an empty search path. Clients cannot directly modify invariant-bearing tables or access invitation hashes and private operational metadata. Read subscriptions must use the same trip authorization, but Realtime revocation/delivery still requires hosted testing.

## Reproduce local checks

```sh
npm ci --ignore-scripts
npm test
dart tests/planning_core/budget_test.dart
```

PGlite 0.5.11 runs the actual PostgreSQL migration and PL/pgSQL/RLS tests. Its harness creates minimal `auth.users` and `auth.uid()` stand-ins, then switches to `authenticated`/`anon` roles. **Never copy those stubs into Supabase.** Supabase provides its real Auth schema. A single embedded connection cannot establish multi-session race correctness, managed Auth/JWT verification, PostgREST behavior or WebSocket delivery. Handler tests inject synthetic RPC/provider responses and are separate from SQL tests.

## Deploy to an isolated test project

Do not run this initial migration against an existing populated project. It has no destructive reset/drop commands, but its object names assume a clean test schema.

1. Create a Supabase test project in the team account. The account owner must handle sign-in, any terms, region and plan choices. Keep credentials out of Git and chat.
2. Review `migrations/202610240001_mvp.sql`, then apply it using the Dashboard SQL Editor or the official CLI migration workflow. Do not apply the test Auth stubs. Record project region, PostgreSQL version and commit.
3. Create synthetic Auth users, sign in and call `upsert_profile` with their own sessions. Confirm denied anonymous and outsider reads through the real Data API.
4. Provision an approved catalog and `private.budget_policies` through a trusted administrator. **No policy or real prices are seeded.** `approved=false`/missing policy blocks valid-budget results. Required categories, price age and transfer buffer must be approved by the team; test values are synthetic.
5. Review the teammate's generation adapter. Configure `PLANNER_URL`, `PLANNER_API_KEY` and exact `PLANNING_ALLOWED_ORIGINS` as server environment values. Supabase supplies its URL/public key. Do not put a service-role credential in Flutter/web. Deploy `planning-api` with JWT verification enabled.
6. Run the hosted acceptance checklist in `docs/server-implementation-evidence.md`, then test simultaneous editors and Realtime removal/reconnect. Add only the required trip/item/vote tables to the Realtime publication after reviewing authorization behavior. This migration deliberately does not enable unverified streaming.

No paid resources or new access permissions are created by the repository changes.

## Price and schedule contract

RPC callers send candidate item UUID, canonical place UUID, calendar day, position (0–199) and UTC start timestamp. Client costs/titles/durations are ignored: the server loads them from an active catalog row. Price is normalized once using persisted party size and `per_group`/`per_person` unit. Unknown/stale/future prices, missing required categories, duplicate place/day charges, unknown hours, overlap and insufficient configured transfer buffer block saving.

Catalog opening hours use ISO weekday keys `1`–`7`, each containing windows such as `[{"open":"09:00","close":"18:00"}]` in the catalog/trip IANA zone. Overnight visits, events, custom unsourced entries, room-capacity/night expansion and road-derived travel times are **not supported** by this increment. The fixed transfer buffer is a reviewed planning assumption, not proof of actual routing feasibility. Do not approve a whole-trip budget policy unless every mandatory economic cost is represented correctly; a visits-only fixture is not a complete real trip.

`save_plan` replaces an ordered snapshot and increments the trip version once. Retained IDs keep votes when their place is unchanged; replacing the place clears votes for the old place. Deleted items remove their votes. A ready unexpired proposal is revalidated on explicit confirmation. Removed members cannot replay cached successful commands. Token retry succeeds only for the original currently active recipient; a new owner-issued invitation is required to reactivate a removed participant.

## HTTP envelope

`POST /functions/v1/planning-api`, JSON `{ "command": "...", "args": { "p_trip": "..." } }`, with caller `Authorization: Bearer ...` and the normal public project API key required by the gateway. Command arguments match the migration's function signatures. Data API RPC is also protected by the same SQL checks.

Example manual save arguments: `p_trip`, `p_expected_version`, `p_items`, `p_request_key`. Proposal confirmation additionally supplies `p_proposal` and `p_confirm: true`; proposed item input is ignored in favor of the stored proposal. Generation uses `generate_plan` with `p_trip`, `p_expected_version`, `p_request_key`; the configured planner adapter returns `{items:[...]}`. Missing provider configuration returns 503, never a fake AI plan. The 25-second timeout applies to each upstream call; no end-to-end <30 second acceptance is claimed.

Public errors contain stable codes, without raw SQL/provider details. SQL calls are also directly testable; HTTP deployment and device/client wiring remain unverified until a test project exists.

## Sources

Implementation security follows [Supabase database-function guidance](https://supabase.com/docs/guides/database/functions) and [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security). The local engine usage follows [PGlite documentation](https://pglite.dev/docs/). These describe mechanisms; passing local tests does not establish production readiness.
