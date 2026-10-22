# Overall Architecture and Use Cases

**Version:** 0.2 — 22 October 2026, proposed integration for first pre-defense.  
**Integration contribution:** Zukhra; backend design: Yerassyl; mobile/AI design: Sayakhat.  
**Status:** no application deployment or interface implementation is asserted. Team scope is confirmed; detailed policies still require review.

This document integrates the [requirements](requirements-specification.md), [backend component design](backend-component-design.md), [database model](database-design.md) and [AI design](ai-module-design.docx). It uses the updated proposal and confirmed team scope: Android/iOS and web from one Flutter codebase, with Supabase as the selected shared backend. D-01 and D-05 are resolved at scope/selection level; other implementation-policy questions remain explicit.

## Editable Diagrams

- Use cases: [draw.io source](../diagrams/use-case.drawio) · [PNG](../diagrams/use-case.png).
- Overall components: [draw.io source](../diagrams/overall-components.drawio) · [PNG](../diagrams/overall-components.png).
- Existing context/backend/ER materials remain available through the [diagram index](../diagrams/README.md). These already describe web/mobile delivery. The integrated view retains their shared backend boundary; remaining policy/schema questions require team review.

The new PNGs and editable sources are generated from the same diagram definitions. PNGs are readable previews; the editable sources retain node/connector IDs and require no image tracing. Dashed provider components are later integrations; Supabase is selected; its authorization, reconnect and transaction behavior must still be validated in the implementation.

## Platform and Delivery Baseline

Both clients are required to implement trip creation, list/map views, voting, comments, chat, assistant and feed against the same authenticated Supabase state. UI layout differs, not the permission model or core domain behavior. The web test deployment is not yet provisioned. Weather/events and optional expenses remain staged features; chat and the minimal post/report workflow are in scope. No client framework, server function or migration has been implemented merely by adding this document.

## Logical Components and Boundaries

| Component | Responsibility | Contract and failure boundary |
| --- | --- | --- |
| Flutter mobile and web presentation | Trip form, draft preview, day/map view, votes/comments/chat, assistant, required community feed and optional expenses. | Carries authenticated identity and current version; displays pending/error states; never decides server authorization. |
| Client state and private read cache | Keep list/map consistent, deduplicate updates, retain explicitly cached confirmed plan. | Cache has trip/version/last-sync metadata. Offline view is read-only. Sign-out removes private cached records. No immediate offline revocation claim. |
| Auth | Sign-in/session/token lifecycle. | Identity alone does not confer trip access. Expired/invalid sessions fail protected operations. |
| Data API and access policies | Membership-scoped ordinary reads and permitted writes. | REST/HTTPS, explicit grants and Supabase/PostgreSQL RLS. Protected invariants cannot be bypassed through direct table writes. |
| Trusted operations | Trip/membership commands, itinerary confirmation, expenses and AI requests. | Authorize actor/action, validate inputs, call providers and commit multi-record updates atomically. Recheck business rules even with privileged database access. |
| Planning pipeline | Candidate filtering, LLM request, budget calculation, route ordering and validation. | Returns a typed draft or structured failure; never trusts model text as a catalog, price list or authorization decision. |
| Database | Authoritative shared state, constraints and history. | The revised 15-table logical model adds invitations, AI proposals, events and post reports, plus catalog/feed fields. See schema-alignment.md; no migrations currently exist. |
| Realtime | Notify authorized clients of committed changes. | Not durable history. Refresh authoritative state after reconnect or membership changes; deduplicate by ID/version. |
| Maps/route adapter | Map rendering and route/travel-time integration. | Google Maps is the client comparison's choice pending API/coverage checks. Protect restricted credentials; disclose missing routes. |
| LLM provider adapter | Structured planning/assistant responses. | Server-held secret, bounded request, controlled error/timeout, no direct database access. Provider/model not yet selected. |
| Weather/event adapters | Fetch dated context when available. | Later scope; validate freshness/coverage. Failure must not invent facts or erase a saved plan. |

These are logical responsibilities, not a requirement to deploy separate microservices. A small trusted-functions codebase may implement the commands and pipeline initially.

## Proposed Command Contracts

Names below describe logical operations, not existing endpoints or files. Concrete REST/RPC paths, schema and deployment runtime must be agreed during implementation.

| Operation | Input | Successful output | Required checks |
| --- | --- | --- | --- |
| CreateTrip | Destination, dates, traveler count, total KZT budget, interests/type | Trip ID, owner membership, initial version | Auth, values, atomic trip/owner creation |
| GenerateDraft | Trip ID, current version, allowed preferences | Draft ID/reference, base version, items, cost breakdown, validation status, warnings | Membership, complete estimates, known places, feasible dates/hours, provider limits |
| ConfirmDraft | Trip ID, draft reference, expected version | New saved version and authoritative totals | Active write permission, matching trip/actor, fresh version, validation, atomic save |
| SetVote | Trip/item IDs, desired value or withdrawal | Current vote and tally | Active write permission, trip/item relationship, one vote per member/item |
| SendMessage | Trip ID, stable client_message_id, text | Saved message with ID/time/actor | Membership, nonempty content, idempotency, durable persistence |
| SaveExpense | Trip ID, payer, amount, shares, expected version | Balanced expense/shares | Permission, exact amounts, same-trip members, currency, transaction |

No LLM response may issue database commands directly. Validate model output before presenting it as valid; reject stale confirmation after a participant changes the itinerary or membership.

## Core Sequences

### Generate and confirm

1. The client validates form fields and submits a generation request with its session and trip version.
2. Trusted operations check membership and load eligible catalog entries and available context.
3. Code determines budget units and feasible candidates. The LLM proposes structured item IDs/explanations; route/budget code and the validator check the complete result.
4. The client previews the draft, estimates and warnings. A missing required price/opening datum prevents a valid label.
5. Explicit confirmation triggers fresh permission/version checks and an atomic write. The new version is returned and authorized clients refresh from saved state.
6. Rejected/expired/invalid drafts leave the confirmed itinerary intact. Retry/fallback behavior is explicit; a fallback must satisfy the same validator.

### Collaborate and recover

Persist a permitted vote/comment/message before notifying peers. A reconnect fetches authoritative state rather than assuming every event was delivered. A repeated send with the same client ID does not duplicate a message. Membership removal revokes new protected reads/writes/events; already downloaded offline data requires the documented cache policy.

## Use-case Catalog

| ID | Name and primary actor | Preconditions | Main flow and successful outcome | Alternate/failure outcome | Requirements |
| --- | --- | --- | --- | --- | --- |
| UC-01 | Account access — visitor | Identity service configured | Register/sign in; receive session; sign out when finished. | Invalid credentials/session produce controlled failure; no private data is exposed. | FR-01 |
| UC-02 | Create trip — organizer | Signed in | Enter valid Astana dates/count/budget/preferences; save trip with owner. | Invalid input or partial failure creates no orphan trip. | FR-02 |
| UC-03 | Generate/confirm plan — owner/editor | Active membership, trip parameters and eligible catalog | Request draft; inspect days/costs/warnings; confirm; save a valid version. | Infeasible/unknown data or provider failure produces explanation, not a falsely valid saved plan. Cancel preserves state. | FR-03/04/06/16/17 |
| UC-04 | Edit plan — owner/editor | A confirmed version exists | Preview add/remove/replace/reorder; inspect recalculated cost; confirm. | Stale version requires refresh; invalid edit is rejected atomically. | FR-05/06 |
| UC-05 | View plan/map — member | Active access and loaded plan | Choose day, switch list/map, inspect place and available external links. | Missing routing/provider leaves readable list and disclosed limitation. | FR-07/19 |
| UC-06 | Invite/manage members — organizer and invitee | Owner access; invitee signs in to accept | Issue invitation; validate acceptance; add one membership; owner may remove member. | Invalid/revoked/expired token fails; removal cannot eliminate last owner. | FR-08 |
| UC-07 | Vote/comment — owner/editor | Item belongs to the trip | Set/change/withdraw vote or add comment; view saved tally/discussion. | Retry cannot double-count; outsider/cross-trip request fails. | FR-09/10 |
| UC-08 | Trip chat — owner/editor; member reads | Active membership | Send message once; others read saved history; recover after reconnect. | Network retry deduplicates; revoked user receives no new private data. | FR-11 |
| UC-09 | Ask AI/change proposal — authorized member | Active permitted trip access | Ask a question or request replacement; inspect answer/change and costs; confirm or cancel. | Unauthorized, unknown-place, over-budget or stale output cannot overwrite the plan. | FR-12/16 |
| UC-10 | Record shared expense — owner/editor | Feature enabled | Enter payer/amount/shares; save exact balanced records and view balances. | Invalid totals/member/currency cause complete rollback. | FR-13 |
| UC-11 | Community posts/reporting — registered user; designated reviewer | Approved public-content/moderation design | Read/publish place-linked post; submit report; reviewer records action. | Private trip fields never become public; unauthorized moderation fails. | FR-14/15 |
| UC-12 | View saved plan offline — prior authorized member | A confirmed plan was cached online | Disconnect; open saved days/costs/details and see last-sync state. | Uncached content is unavailable; online actions explain connection requirement; sign-out clears cache. | FR-18 |

The use-case diagram summarizes goals. It deliberately omits automatic “include” arrows for optional weather, events and expense features, and does not model a provider as a human participant. The mobile/web clients plus backend form the software-system boundary; providers remain external dependencies.

## Integration Review Checklist

- Review the resolved scope/selection records D-01/D-05 and agree the remaining D-02/03/04/06/07/08 policies; update affected AI/backend/UX materials together.
- Map every Must requirement to an acceptance case and component; preserve IDs during revision.
- Review the schema-alignment.md contracts for invitations, moderation, catalog freshness, expenses and versioned AI drafts.
- Verify selected Supabase authorization, transaction, live-update and reconnect behavior in a proof of concept.
- Record actual reviewer/supervisor comments and resulting changes; do not describe this draft as approved.
