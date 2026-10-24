# Database Design

## Five-function MVP boundary (23 October 2026)

This revision follows the supervisor scope recorded in [PR #10](https://github.com/yer455yl/collaborative-trip-planning/pull/10) and the [proposed responsibility split](mvp-scope-and-responsibilities.md). Android, iOS and web remain planned. Detailed ownership and interface acceptance are pending teammate replies; this document does not approve PR #10.

| Scope | Tables and responsibility |
| --- | --- |
| MVP support | `users`, `trips`, `participants`: authenticated trip creation and active owner/editor access |
| MVP planning | `places`, `plan_items`: catalog identifiers, route/map data and whole-party planned costs |
| MVP collaboration | `votes`, `invitations`: one current vote, owner-issued invitation and atomic acceptance |
| MVP generation | `ai_proposals`: initial route draft, validation and explicit versioned confirmation; no conversational editor |
| Deferred, retained | `events`, `comments`, `chat_messages`, `posts`, `post_reports`, `expenses`, `expense_splits` |

All **15** table definitions and results of PR #8/#9 are retained. `trips.expenses_enabled`, `places.booking_url`, `plan_items.event_id` and `item_type=event` are future fields; retaining them does not enable those capabilities. Actual expenses/debts differ from planned estimates. Weather, offline access and booking integrations are deferred. Future text below describes retained design only wherever it concerns these domains.

MVP invariants: owner = Organizer; editor = Participant; inactive members have no access. Both active roles edit/vote; only the owner administers invitations/membership. Initial generation uses the same trusted validation as manual editing. `plan_items.estimated_cost` is already normalized for the whole party. Never multiply it by traveler count again. Server-owned catalog prices, required categories and freshness policy must be checked independently of client totals. See the [proposed wire/transaction contract](mvp-server-contract.md) for errors, dates, units, confirmation and open questions.


This proposed logical schema supports the web and mobile trip-planning clients. It contains 15 application tables for the selected Supabase/PostgreSQL backend. The 22 October revision is specified in [Schema Alignment](schema-alignment.md); the complete field inventory is [schema-design.json](../config/schema-design.json). It has not been deployed: SQL migrations, access policies and runtime tests are separate implementation tasks.

## Diagram files

The editable source is [database-er.drawio](../diagrams/database-er.drawio). It contains four pages describing the same database; a repeated table is a reference, not a duplicate physical table.

- [Membership and expenses](../diagrams/er-membership-expenses.png)
- [Itinerary and voting](../diagrams/er-itinerary-voting.png)
- [Communication and community](../diagrams/er-communication-community.png)
- [AI proposals](../diagrams/er-ai-proposals.png)

PK means primary key, FK means foreign key, and UQ means unique constraint. A parent has zero or more child records; each child has one parent unless its reference is marked nullable. Lines summarize table relationships; FK fields show the complete key mapping. The draw.io source uses editable table text and relationship lines. The PNGs use the same schema definitions, but were generated separately rather than exported by the draw.io application; the previous three-page revision was opened in draw.io on 20 October. The current four-page revision is generated reproducibly from the canonical field inventory; see the PR validation record for current checks.

## Tables and relationships

| Table | Purpose and key relationships |
|---|---|
| users | Application profiles; id matches the selected authentication service's user ID. Passwords are managed by the identity provider, not stored here |
| trips | Trip dates, destination, budget, currency and version |
| participants | Joins users and trips; primary key (trip_id, user_id) prevents duplicate membership and stores the trip-specific role |
| places | Shared place catalog with coordinates, source, opening hours and estimated visit cost |
| plan_items | Ordered itinerary entries for a trip date; optional place reference allows custom activities. The creator must belong to the same trip |
| votes | One current upvote or downvote per participant and plan item; deleting the row withdraws a vote |
| comments | Comments on itinerary items; author and item must belong to the same trip |
| chat_messages | Durable trip chat; sender must belong to the same trip. A unique client message ID per sender and trip prevents duplicate inserts on retry |
| posts | Community content by a user; optionally linked to a trip. A public post must not expose private trip records |
| expenses | Records the amount, payer and creator within one trip; payer and creator reference that trip's membership records |
| expense_splits | Allocates an expense among trip participants. Each participant has at most one share per expense |
| events | Dated, sourced local events linked to catalog places, with availability and price context |
| invitations | Expiring and revocable hashed invitations with atomic one-time acceptance |
| ai_proposals | Versioned private AI drafts, validation results and atomic confirmation outcomes |
| post_reports | One report per user/post, with restricted moderation disposition |

Composite references such as votes(trip_id, plan_item_id) → plan_items(trip_id, id) prevent linking a record to an item in another trip. The target needs UQ(trip_id, id), even though id is also its primary key. References to participants always target (trip_id, user_id). The same rule applies to comments, expenses and expense_splits. Multiple FK columns referencing the same table are separate constraints, even if represented by one relationship line.

## Integrity and access rules to implement

1. **Trip ownership:** participants has owner (Organizer) and editor (Participant) roles; viewer is deferred. Exactly one active owner is required. Create the trip and initial owner in one transaction; a partial unique constraint can prevent multiple owners, but a transaction/function must also prevent removing the last owner. Invitations are not stored as participants before acceptance; the invitations table stores expiry, revocation, token hash and acceptance state.
2. **Membership history:** use left_at to mark departure and retain membership rows referenced by historical messages or expenses. Access checks must require active membership. Rejoining should reuse the membership identity or use an explicitly designed history model.
3. **Authorization:** foreign keys prove record relationships, not permission to act. Enforce owner/editor permissions using RLS and trusted server operations. Public posts expose only deliberately published content. Check posting rights when attaching a trip; users cannot obtain write access merely by supplying another user's ID.
4. **Itinerary order:** day_date must fall within trip dates; position must be nonnegative and unique within (trip_id, day_date). Reorder entries transactionally, using a deferrable uniqueness constraint or another collision-safe ordering strategy. Changing trip dates must revalidate existing entries. starts_at is optional; use the trip's IANA time_zone identifier and validate schedule consistency.
5. **Voting:** constrain value to -1 or 1. The diagram assumes voting on itinerary items; separate candidate proposals or polls require a later model change if specified by the team.
6. **Money:** the initial version uses one currency per trip. Expense amounts, splits and plan-item cost estimates use that currency. Place-catalog estimates include their own currency and require an explicit conversion or rejection before use. Use exact decimals, positive expense amounts and nonnegative shares. Require the shares to sum exactly to the expense amount in an atomic server/database operation; a simple row CHECK cannot enforce a cross-row total. Record refunds and settlements only after their requirements are agreed.
7. **Concurrent changes:** check version values on trip/itinerary updates, reject stale changes and increment versions atomically. Save AI output only after server validation and user confirmation; AI drafts are persisted in ai_proposals with base version, validation state and confirmation metadata; see the alignment contract.
8. **Deletion:** default to restricted deletion for referenced users, membership records and financial data until retention rules are agreed. For trip removal, use a documented archival or transactional deletion policy; do not assume cascading deletion is safe for every table.
9. **Validation:** require nonempty titles/bodies where applicable; validate coordinate ranges, nonnegative costs and durations, start_date ≤ end_date, and valid currency codes. Set required timestamps and server-generated identifiers consistently.

## Scope and verification

The revised fields cover the named trip preferences, catalog provenance, events, private AI proposals, invitations and minimal place-linked feed/reporting scope. Notifications, full AI conversation history, multi-attachment social features, payments, exchange-rate history and multi-payer expenses are not modeled yet. They must not be presented as implemented capabilities.

Before implementation approval, review this model with Zukhra's requirements and Sayakhat's UI/AI workflows. Verify with meaningful database tests that cross-trip references, duplicate votes and retry duplicates are rejected; inactive members lose access; concurrent reorders remain valid; expense shares balance; and public posts do not reveal private trip data. No database execution or migration validation has yet taken place.
