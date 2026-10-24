# Yerassyl's Contribution Checklist

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


Updated 22 October 2026 against current repository artifacts. Original work-plan deadlines were 15–20 October; this checklist does not claim on-time delivery. Checked items mean a deliverable exists, not that it is approved, implemented or tested.

## Repository and Collaboration

- [x] Create repository and initial src/docs/diagrams/tests/config structure.
- [x] Verify accepted collaborator access for shauzatov and Zukhra2409 during the 20 October session.
- [x] Submit initial backend/research contribution through PR #1; it is merged.
- [ ] Verify supervisor access and actual review feedback.
- [ ] Obtain another member's review of the current schema-alignment PR before merging.
- [ ] Link accepted evidence to relevant YouTrack tasks and mark Fixed only where criteria are met.

## Literature and Technology

- [x] Prepare five initial sources (three scientific publications and two official technical guides) with analysis and limitations.
- [x] Integrate the contribution by reference in the common literature review; the common review is present in main.
- [ ] Complete and personally verify outstanding full-text reading; prepare to explain each cited source.
- [x] Compare Firebase, Supabase, Node.js/PostgreSQL and REST/Realtime/WebSocket.
- [x] Record the confirmed selection: Supabase shared by Flutter mobile and web.
- [ ] Run the authorization/transaction/reconnect proof of concept.

## Architecture, Data and Verification

- [x] Provide editable System Context and backend Component diagrams with PNGs.
- [x] Integrate backend boundaries by reference in the overall Component/Use Case document now present in main.
- [x] Prepare the initial ER model and its domain views.
- [x] Revise the logical model with traveler count/type/interests, preferred language, catalog fields, item type, events, AI proposals, invitations and place-linked posts/reports.
- [x] Align database/UI roles: owner = Organizer, editor = Participant; viewer deferred.
- [x] Provide a reproducible field inventory and four-page editable ER source with PNG previews.
- [x] Map server verification cases to FR/NFR IDs; retain all 32 prior cases with scope labels and add three MVP cases (35 planned total).
- [x] Connect server checks to the overall evaluation plan, including client generation timing, budget, SUS and manual comparison protocols.
- [ ] Obtain team review of detailed schema, media/moderation/freshness policies, AI/UX confirmation flow and metric targets.
- [ ] Implement migrations, RLS, trusted commands and clients; execute the planned tests. No implementation is claimed here.

## Shared Readiness

- [x] Locate requirements, Use Case/overall Component sources, survey aggregates and combined literature in the current repository.
- [ ] Complete comparable Astana competitor-output evidence and verify remaining team deliverables against the work plan.
- [ ] Verify actual supervisor review and release readiness. Existing tag prob-period-1 is not evidence that all checks passed.
- [ ] Record personal research participation accurately. Existing survey results do not prove my involvement; interviews are not used in the current submission.

All project documentation is maintained in English. Each member must use their own account and record their actual contribution. Do not manufacture authorship, reviews, research responses, reading completion or passing test results.
