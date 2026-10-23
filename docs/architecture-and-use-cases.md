# Overall MVP Architecture and Use Cases

Revision: 23 October 2026. Integration owner: Zukhra; backend contribution: Yerassyl; generation/map contribution: Sayakhat. The [scope revision](mvp-scope-and-responsibilities.md) applies the supervisor's five-function MVP recommendation. Detailed team review is pending. Existing backend/schema work is retained; extra schema fields do not make deferred features mandatory.

## Components and ownership

| Component | Responsibility and owner | Boundary |
| --- | --- | --- |
| Trip form and editor | Zukhra: validated inputs; add/remove/replace/reorder; budget impact and confirmation; voting/invitation client controls. | Initial pure budget preview is implemented; Flutter controls remain planned. Never authorizes a database write. |
| Budget and constraints | Zukhra: exact KZT normalization, daily/category totals, unknown-data handling and edit preview; later schedule/catalog constraints. | [Initial Dart contract](planning-budget-module.md). Supplied evidence and client totals remain untrusted server inputs. |
| Flutter shell, AI and map | Sayakhat: navigation/composition, candidate/LLM adapter, day list/map and provider errors. | Pass catalog IDs and explicit source/units to validation; no invented prices. A conversational assistant is deferred. |
| Supabase Auth and commands | Yerassyl: identity, active owner/editor membership, invitations, versioned save/confirm, votes, RLS and transactions. | Revalidate costs/catalog/permission/version on the server, commit atomically, deny removed users. |
| PostgreSQL and Realtime | Yerassyl: authoritative state and authorized update notifications. | Restore persisted state on reconnect. Notification delivery is not durable history or conflict resolution. |
| Providers | Sayakhat integrates model and map/route provider. | Credentials handled according to provider restrictions; private model secrets stay server-side. Coverage, cost and latency need actual checks. |

Mobile and web retain the prior Flutter Android/iOS/web target until the team explicitly changes it. No complete app, deployed database or production API is claimed. The runtime artifact here is a standalone Dart calculation module.

## MVP flow

1. The user signs in and enters dates, party size, interests and budget.
2. Authorized trip creation stores one owner. Generation uses eligible catalog candidates and a server-held model credential.
3. The proposed itinerary passes code-based identity, date/time and cost checks. Client preview displays totals and errors; invalid/incomplete output cannot be called valid.
4. Confirm rechecks membership, current version, source data and constraints on the server; a transaction writes one version. A stale/invalid request preserves the existing plan.
5. List/map show the same day/version. An authorized editor can preview a change, recalculate, confirm or cancel.
6. An owner invites an editor; voting uses one current vote per user/item. Saved changes reach authorized peers and refresh after reconnect.

`TripBudget` and `BudgetLine` are local arithmetic DTOs, not implemented network endpoints. Existing [schema alignment](schema-alignment.md) normalizes plan-item estimates to whole-party values. Do not multiply those values again. Proposed commands CreateTrip, GenerateDraft, ConfirmDraft, SetVote and AcceptInvitation remain server implementation work; define actual payloads/errors before integration.

## Use cases

| ID | MVP goal and actor | Acceptance/failure boundary | Requirements |
| --- | --- | --- | --- |
| UC-01 | Sign in/register, user | Valid identity establishes a session; invalid identity exposes no private trip. | FR-01 |
| UC-02 | Create a trip, user | Validate inputs; trip and owner are created atomically. | FR-02 |
| UC-03 | Generate/preview/confirm, editor/owner | Known places and complete estimates; no saved-state mutation before authorized confirmation. Unknown/infeasible output fails clearly. | FR-03/04/06 |
| UC-04 | Edit the itinerary, editor/owner | Add/remove/replace/reorder; recalculate; reject stale/invalid confirmation without lost updates. | FR-05/06 |
| UC-05 | View plan/map, active member | Same selected day/order/version; routing failure leaves readable list and explicit limitation. | FR-07 |
| UC-06 | Invite/manage participants, owner/invitee | One controlled acceptance; invalid token rejected; revoked member loses private access. | FR-08 |
| UC-07 | Vote, owner/editor | Set/change/withdraw; one vote per actor/item; outsider denied. Item comments are deferred. | FR-09 |
| UC-13 | Inspect planned budget, active member | Daily/category/whole-party estimate, remainder and unknown-data errors; not actual payments/debts. | FR-06 |

Historical UC-08–12 (chat, assistant, expenses, feed and offline) are deferred; IDs are not reassigned. The [Use Case source](../diagrams/use-case.drawio) contains two editable MVP pages and [overall Component source](../diagrams/overall-components.drawio) covers only MVP responsibilities. PNGs are generated from the same definitions, not falsely described as native exports.

## Data scope and integration review

Retain Yerassyl's [database model](database-design.md), field inventory and existing migration design. Users, trips, participants, places, plan_items, votes, invitations and ai_proposals support the core. Comments/chat/posts/reports/events/expenses/share tables are retained future design, not MVP release gates. Do not remove tables or claim that migrations/RLS exist without checking the implementation.

Backend/context/ER sources and older AI/UX Word files require their owners' scope alignment before final report generation. [Supervisor response](supervisor-feedback.md) records those pending actions. Keep submitted tags unchanged and avoid mixing a new report with the old `prob-period-1` snapshot.
