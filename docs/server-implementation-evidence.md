# Server Implementation and Verification Evidence

Owner: Aman Yerassyl (`yer455yl`). Task: DIP-28, related DIP-27 and DIP-31. Observed 24 October 2026. Separate implementation increment after the design corrections in PR #12; no historical authorship, release tag or PDF is rewritten.

## Implemented artifacts

| Artifact | Executable behavior |
| --- | --- |
| [Migration](../supabase/migrations/202610240001_mvp.sql) | Eight MVP tables, foreign keys, unique current vote, active-owner uniqueness, RLS and restricted grants; profile/trip/membership/planning/voting commands plus authorized generation retry and consistent snapshot reads |
| Private SQL helpers | Same-trip authorization and locking, exact catalog-derived budget/schedule validation, payload-bound idempotency records; no client-supplied identity or costs trusted |
| [HTTP handler](../supabase/functions/planning-api/handler.mjs) | Caller-JWT RPC forwarding, command/argument allowlists, actual body-size limit, CORS allowlist, redacted error mapping and generation orchestration |
| [Edge entrypoint](../supabase/functions/planning-api/index.ts) | Supabase runtime configuration and JWT-verified function entry; not deployed |
| [SQL tests](../tests/server/database.test.mjs) | Actual PostgreSQL execution with explicit authenticated/anonymous roles and a test-only Auth identity stub |
| [HTTP tests](../tests/server/planning-api.test.mjs) | Web Request/Response execution with injected RPC/provider responses; no live gateway/provider |
| [CI workflow](../.github/workflows/server-checks.yml) | Reproducible npm install and checks on pull requests/main; a local run does not prove hosted CI has passed |

All 15 logical tables from PR #8/#9 are retained in the design inventory. Seven deferred tables are not enabled by the initial MVP migration. `event_id` is reserved/null; only sourced place entries are implemented. No expense/chat/feed capability is claimed.

## Observed local results

Environment: macOS arm64, Node v26.0.0, PGlite 0.5.11, Dart 3.11.3. `npm test` completed successfully: **72 runner tests, 72 passed, 0 failed**. This includes one parent SQL test container. Existing Dart checks separately passed **34/34**.

The Node runner counts parent containers. The actual run comprises **31 SQL subcases, one SQL parent, 11 HTTP cases, two client-adapter cases and 27 helper cases = 72 runner tests**. Thus there are **71 substantive test cases**, not 70 independent product acceptance scenarios. Each case may exercise several inputs. Results are synthetic fixtures, not merchant pricing, measured UI performance or a deployed product.

Commands:

```sh
npm ci --ignore-scripts
npm test
dart tests/planning_core/budget_test.dart
```

## Verified SQL properties and remaining boundaries

| Server plan area | Local evidence | Still not established |
| --- | --- | --- |
| ACC-01/02/03 | Owner/editor controls; outsider/anonymous denial; direct write/private helper denial; foreign-item rejection and atomic rollback | Real signed JWT/Data API integration and every attack path |
| ACC-04/05 | Removed-member SQL reads/commands fail; old invitation cannot restore removed access; last owner protected; transfer leaves one owner | Realtime subscription revocation and simultaneous ownership/removal races |
| VOT-01/03 | One stored current vote, retry/change/withdrawal, invalid value and outsider rejection; retained item vote persists; replacement place clears old votes | Multi-session conflicting vote race and device display |
| ITN-01/02 | Stale-version rejection; ordered complete replacement; catalog/date/schedule checks; failure leaves previous plan intact | Concurrent independent database sessions and road-derived travel feasibility |
| INV-01/02 | Owner-only issue/revoke; only token hashes stored; expiry/revocation rejection; same-recipient retry; other-recipient replay rejection; reactivation via new token | Two simultaneous acceptance sessions on hosted Postgres |
| AI-01/02/03 and AIP-01 | Candidate preview does not change saved plan; explicit confirmation, second confirmation rejection, revalidation and idempotency; SQL proposal/status rollback | Real LLM integration, broad malformed-output corpus and live provider conditions |
| AI-04/05 | HTTP handler denies unauthorized generation before provider call; controlled missing-provider/network errors; no raw SQL error disclosure | Real provider timeout/error behavior, quotas and credentials deployment |
| CAT-01/BUD-01 | Server-owned prices, no double party multiplication, exact budget equality/one-cent excess, missing/stale/future prices and required-category failures | Verified Astana catalog and approved whole-trip cost/transport/lodging policy |
| SAV-01 | Injected AFTER UPDATE failure rolls back items/trip version/proposal; foreign-item failure restores prior rows | Simultaneous revocation/save race in a multi-session environment |
| SYN-01/VOT-02 | Database version and authoritative reads available | Live two-client synchronization/reconnect and competing sessions remain Not run |
| Deferred cases | Retained in the test plan without activating feature tables | Not run; excluded from MVP acceptance |

The [35-case plan](server-testing-plan.md) remains the product/server acceptance specification. These local results provide **partial evidence**, not a blanket Pass for every mapped case. The migration and test harness use PostgreSQL semantics, but PGlite has a single connection; it cannot prove multi-session races or managed Supabase services. The Auth stub supplies a synthetic current subject, not JWT verification.

## Required hosted completion checklist

- [ ] Account owner creates a clean test Supabase project and records region/version.
- [ ] Another teammate reviews migration, grants, command contract and this evidence; merge only after review.
- [ ] Apply the reviewed migration to the test project; verify roles/policies through real user sessions and Data API/RPC.
- [ ] Curate source-backed Astana places and approve required categories, freshness, opening hours, duration and transport assumptions. Synthetic fixture policy must not be deployed as approved real data.
- [ ] Configure and deploy the Edge function and teammate's AI adapter; test real JWT errors, provider failure and secret redaction.
- [ ] Test two competing clients/sessions for invitation acceptance, votes, stale edit and removal/save races.
- [ ] Enable only reviewed Realtime tables and verify no private data after removal; test reconnect reload on Android/iOS/web.
- [ ] Wire the teammate-owned Flutter client to commands and map; record device/browser checks.
- [ ] Measure real generation timing, budget quality, SUS and the manual baseline using the team protocol. No such results are asserted here.

The implementation intentionally fails closed when no approved catalog/policy/provider exists. It does not turn unknown prices into zero or supply a synthetic AI result. Keep DIP-27/28/31 In Progress/Open until their complete acceptance criteria are evidenced. Do not mark integration or product evaluation Fixed from local unit/database checks alone.

## Team decisions still open

The exact HTTP wire adapter, catalog/provider ID mapping, transfer/lodging policy, freshness threshold, DIP-30/DIP-32 ownership split and updated release/report revision need recorded teammate responses. Public source-code availability or a merged design PR is not acceptance of every runtime detail.
