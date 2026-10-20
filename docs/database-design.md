# Initial Database Design

This proposed logical schema supports the web and mobile trip-planning clients. It contains 11 application tables and is intended for PostgreSQL. It has not been deployed: SQL migrations, access policies and runtime tests are separate implementation tasks.

## Diagram files

The editable source is [database-er.drawio](../diagrams/database-er.drawio). It contains three pages describing the same database; a repeated table is a reference, not a duplicate physical table.

- [Membership and expenses](../diagrams/er-membership-expenses.png)
- [Itinerary and voting](../diagrams/er-itinerary-voting.png)
- [Communication and community](../diagrams/er-communication-community.png)

PK means primary key, FK means foreign key, and UQ means unique constraint. A parent has zero or more child records; each child has one parent unless its reference is marked nullable. Lines summarize table relationships; FK fields show the complete key mapping. The draw.io source uses editable table text and relationship lines. The PNGs use the same schema definitions, but were generated separately rather than exported by the draw.io application; editor rendering still needs checking.

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

Composite references such as votes(trip_id, plan_item_id) → plan_items(trip_id, id) prevent linking a record to an item in another trip. The target needs UQ(trip_id, id), even though id is also its primary key. References to participants always target (trip_id, user_id). The same rule applies to comments, expenses and expense_splits. Multiple FK columns referencing the same table are separate constraints, even if represented by one relationship line.

## Integrity and access rules to implement

1. **Trip ownership:** participants has owner, editor and viewer roles. Exactly one active owner is required. Create the trip and initial owner in one transaction; a partial unique constraint can prevent multiple owners, but a transaction/function must also prevent removing the last owner. Invitations are not stored as participants before acceptance; an invitation table is deferred until that workflow is designed.
2. **Membership history:** use left_at to mark departure and retain membership rows referenced by historical messages or expenses. Access checks must require active membership. Rejoining should reuse the membership identity or use an explicitly designed history model.
3. **Authorization:** foreign keys prove record relationships, not permission to act. Enforce owner/editor/viewer permissions using RLS and trusted server operations. Public posts expose only deliberately published content. Check posting rights when attaching a trip; viewers cannot obtain write access merely by supplying another user's ID.
4. **Itinerary order:** day_date must fall within trip dates; position must be nonnegative and unique within (trip_id, day_date). Reorder entries transactionally, using a deferrable uniqueness constraint or another collision-safe ordering strategy. Changing trip dates must revalidate existing entries. starts_at is optional; use the trip's IANA time_zone identifier and validate schedule consistency.
5. **Voting:** constrain value to -1 or 1. The diagram assumes voting on itinerary items; separate candidate proposals or polls require a later model change if specified by the team.
6. **Money:** the initial version uses one currency per trip. Expense amounts, splits and plan-item cost estimates use that currency. Place-catalog estimates include their own currency and require an explicit conversion or rejection before use. Use exact decimals, positive expense amounts and nonnegative shares. Require the shares to sum exactly to the expense amount in an atomic server/database operation; a simple row CHECK cannot enforce a cross-row total. Record refunds and settlements only after their requirements are agreed.
7. **Concurrent changes:** check version values on trip/itinerary updates, reject stale changes and increment versions atomically. Save AI output only after server validation and user confirmation; AI drafts are not yet a persisted entity in this model.
8. **Deletion:** default to restricted deletion for referenced users, membership records and financial data until retention rules are agreed. For trip removal, use a documented archival or transactional deletion policy; do not assume cascading deletion is safe for every table.
9. **Validation:** require nonempty titles/bodies where applicable; validate coordinate ranges, nonnegative costs and durations, start_date ≤ end_date, and valid currency codes. Set required timestamps and server-generated identifiers consistently.

## Scope and verification

Initial fields are intentionally limited to the work plan's entities and core relationships. Detailed invitation tokens, notifications, media attachments, AI conversation history, payments, exchange-rate history and multi-payer expenses are not modeled yet. They must not be presented as implemented capabilities.

Before implementation approval, review this model with Zukhra's requirements and Sayakhat's UI/AI workflows. Verify with meaningful database tests that cross-trip references, duplicate votes and retry duplicates are rejected; inactive members lose access; concurrent reorders remain valid; expense shares balance; and public posts do not reveal private trip data. No database execution or migration validation has yet taken place.
