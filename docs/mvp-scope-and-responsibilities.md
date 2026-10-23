# Five Function MVP and Technical Responsibilities

Revision prepared by Kabysheva Zukhra, 23 October 2026, following the supervisor feedback supplied by the team. This branch applies the reduced scope for review; it does not claim that every detailed assignment or platform choice has been approved by all members. It supersedes earlier broad feature promises in the requirements and integrated architecture. Sayakhat must align the proposal, topic report, UX and risk source documents; Yerassyl must align the backend/schema views. Original authorship and submitted tags remain unchanged.

## Mandatory product outcomes

| MVP | User outcome | Requirements |
| --- | --- | --- |
| M1 Create a trip | Enter Astana dates, traveler count, interests and an estimated budget; invalid input is rejected. | FR-01/02 |
| M2 Generate a route | Receive a grounded itinerary draft; inspect its constraints and explicitly confirm a valid plan. | FR-03/04 |
| M3 Budget the plan | See daily/category/whole-trip estimates and remaining budget; edits trigger recalculation. | FR-06 |
| M4 View the map | View the same selected day and ordered catalog places on the map; failures remain visible. | FR-07 |
| M5 Plan together | Invite an authorized participant, edit the shared plan and vote on itinerary items; stale writes do not silently overwrite changes. | FR-05/08/09 |

Authentication, a curated catalog, access checks, validation and persistence support these five outcomes; they are not extra headline features. Budgeting means planned cost estimation, not bookkeeping of actual payments or debt settlement.

Chat, item comments, community posts/moderation, a conversational AI editor, actual expense splitting, weather/events, offline access and booking links are deferred Could features. Existing schema fields and historical mockups for them are retained as design work, not required implementation. Do not delete teammate work or close deferred implementation tasks as completed.

## Balanced ownership

| Member | Primary engineering ownership | Interfaces and proof |
| --- | --- | --- |
| Kabysheva Zukhra Yerzhankyzy, SE-2409 | Trip creation and client input validation; deterministic planned-cost model and constraints; route editor with budget preview; planning/voting client behavior; unit and client tests for these modules. | Accept normalized catalog estimates from Sayakhat; call Yerassyl's authorized/versioned commands. Show code, tests and later working form/editor, not only reports. |
| Aman Yerassyl, SE-2401 | Supabase setup, schema/migrations, authentication integration, RLS; invitations, versioned persistence, voting and peer synchronization; server revalidation and API/database tests. | Recompute/revalidate before commit independently of the client. Client budget code is not a security boundary. Show migrations, commands/policies and executed tests when available. |
| Shauzat Sayakhat Anarbekuly, SE-2431 | Flutter shell/shared navigation and visual composition; AI generation/candidate selection adapter; day-plan and map integration; provider-error behavior and AI/map integration tests. | Produce catalog IDs and typed drafts, not invented costs. Integrate Zukhra's trip/editor/budget modules without claiming their authorship. Coordinate proposal/UX/risk updates. |

Work is balanced by scope, engineering difficulty, integration responsibility and evidence, not equal task counts. Each member reviews another member's PR. Requirements/research/report coordination remain Zukhra's additional work, not a substitute for development. Team acceptance is still required; do not reattribute earlier commits.

## Current work versus planned work

- Prepared now: revised requirements, evaluation scope, overall/use-case diagrams, this ownership decision and the real supervisor-feedback record.
- Implemented initial core in this branch: standalone Dart estimate arithmetic and pure edit preview in [budget.dart](../src/planning_core/budget.dart), tracked by [DIP-42](https://dip-trip-planner.youtrack.cloud/issue/DIP-42). This is not a Flutter form/editor or a server implementation. See [module contract](planning-budget-module.md).
- Still planned for Zukhra: Flutter trip form, editor/voting controls, catalog/date/time feasibility beyond arithmetic, API integration and UI tests. Existing [DIP-34](https://dip-trip-planner.youtrack.cloud/issue/DIP-34) concerns collaboration. Split new tasks using real IDs and estimate implementation dates with the team; do not assign tomorrow's submission deadline to the entire product.
- Task mapping needs team action: DIP-30 currently belongs to Sayakhat but the proposed trip-form ownership is Zukhra; DIP-32 must distinguish Sayakhat's generation from Zukhra's budget validation; DIP-35–40 become optional backlog. DIP-36 is actual expense splitting, not this budget engine. Preserve its meaning.

## Platforms and delivery

The prior baseline specifies Flutter Android/iOS and web with shared Supabase. This feature reduction does not silently remove a platform. The team must record the feasible build/test matrix before implementation; one primary demonstration platform can be selected only through an explicit scope decision. No untested builds are claimed.

## Before the 24 October submission

1. Review this branch and the technical ownership split with the team.
2. Sayakhat aligns proposal/topic/client-AI/UX/risk sources; Yerassyl aligns schema/backend/test scopes. Do these on current main/task branches after integrating this revision, avoiding concurrent edits of Zukhra-owned files.
3. Record actual follow-up decisions under [supervisor feedback](supervisor-feedback.md); prepared changes are not proof of advisor acceptance or completed software.
4. Regenerate the eleven-section report and task screenshot PDF from the final reviewed repository version. Previous PDFs and `prob-period-1` still describe the older commit. Never move or replace an existing submitted tag; agree the final version with the supervisor if the submission must be updated.
5. The supplied supervisor message confirms 24 October 2026, 18:00 for the form. The user submits it; this work does not submit the form.
