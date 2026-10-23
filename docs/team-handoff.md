# Backend Contribution Handoff

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


Updated 22 October 2026. Prepared by Aman Yerassyl. The repository contains design/research deliverables and local deterministic budget/helper checks. There is no deployed backend or executed database/API test report.

## Confirmed Scope and Current Integration

- Flutter mobile (Android/iOS) plus web use the same core features and shared backend.
- Supabase/PostgreSQL/Auth/REST/Realtime is selected. A proof of concept still needs to verify policies, atomic commands and reconnect recovery; the platform choice itself is no longer open.
- Database roles are owner = Organizer and editor = Participant. Viewer is deferred. Only the owner administers membership; active owners/editors collaborate.
- [Integrated literature](literature-review.md) includes all three contributions. Full-text reading limitations remain explicit; integration does not prove each member has read every paper.
- [Requirements](requirements-specification.md), [overall architecture and Use Cases](architecture-and-use-cases.md), and [team evaluation](verification-and-evaluation-plan.md) are present. They still need review and implementation evidence.
- [Schema alignment](schema-alignment.md) expands the initial model to 15 tables with trip preferences, catalog provenance, events, invitations, AI proposal lifecycle and minimal feed/report persistence.
- [Server testing](server-testing-plan.md) maps 35 proposed cases (22 MVP, 13 deferred) to FR/NFR IDs. The earlier contribution had 25 cases; seven cases cover the schema revision. All are Not run.

## Materials and Review Actions

| Material | Location | Remaining review |
| --- | --- | --- |
| Backend sources | [Personal literature contribution](literature/yerassyl-literature-review.md) | Finish full-text reading and explain limitations personally |
| Backend rationale | [Technology comparison](backend-technology-comparison.md) | Verify selected Supabase behavior with a proof of concept |
| Context and components | [Diagram index](../diagrams/README.md), [backend](backend-component-design.md), [overall](architecture-and-use-cases.md) | Check shared boundary and client/AI/provider contracts together |
| Revised logical data model | [Database design](database-design.md), [alignment](schema-alignment.md), [editable ER](../diagrams/database-er.drawio) | Review 15-table fields, role mapping, publication policy, source freshness and confirmation transaction |
| Verification | [Server plan](server-testing-plan.md), [overall plan](verification-and-evaluation-plan.md) | Review requirement coverage and metric targets; implement fixtures before execution |
| Completion evidence | [Checklist](yerassyl-checklist.md) | Keep unverified work unchecked; record real task evidence after review |

## Remaining Decisions and Evidence

1. Approve detailed invitation, moderation, media, retention and catalog freshness policies from the proposed schema contract.
2. Review the aligned AI/UX source descriptions and add preview/confirmation controls to the static wireframes; do not silently overwrite a shared plan.
3. Select the LLM provider/model and verify map/provider coverage and quotas. Google Maps is the client design choice, subject to coverage/API checks.
4. Review the proposed collaboration timing target; measure client generation time separately from server elapsed time.
5. Implement migrations, RLS and trusted transactions, then execute tests. No diagram constitutes implementation evidence.
6. Obtain actual team/supervisor feedback and verify supervisor repository access.
7. Capture comparable Astana outputs for competitor evaluation; form screenshots alone do not establish output quality or absence of local coverage.

## Review and Release Process

PR #1 was merged; the earlier statement that it was still open was obsolete. Current changes must use task-named branches and Pull Requests, with another member's review before merge. This revision does not assert reviewer approval. An existing `prob-period-1` tag was found during inspection; do not move it or describe it as a newly verified release. A new release tag requires a checked team package and agreement on naming.

The repository includes a YouTrack board link and real DIP task IDs. Add links to the accepted commit/PR in the corresponding tasks; mark Fixed only when their acceptance criteria are satisfied. Private task exports and account details do not belong in the public repository. Collaborator access was observed previously; current supervisor access and task completion require direct verification.
