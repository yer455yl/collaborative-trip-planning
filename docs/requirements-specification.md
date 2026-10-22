# Requirements Specification

**Project:** Development of a Mobile Application for Collaborative Trip Planning  
**Prepared for:** Kabysheva Zukhra's requirements and integration contribution  
**Version:** 0.2, 22 October 2026 — proposed baseline for team/supervisor review  
**Milestone:** First pre-defense, 24 October 2026

## 1. Purpose and Sources

This specification turns the [proposal](project-proposal.docx), [topic report](topic-report.docx), [AI design](ai-module-design.docx) and existing backend designs into individually verifiable requirements. It is a design deliverable, not an implementation or test report. Priorities and detailed policies below are proposals until reviewed. The [15-response survey snapshot](research/survey-results.md), inspected on 22 October 2026, informs the baseline. Interviews are not used for this submission. The user confirmed mobile plus web, Supabase, trip chat and the post feed as the current team scope; selection does not imply deployed services.

Must means essential to the proposed diploma product; Should means planned after the core workflow; Could means optional. These priorities do not require implementation before the first pre-defense. The core prototype target on both clients is account → trip → validated itinerary preview → confirmation → map → shared update. Chat and a place-linked post feed remain in the diploma scope even though the current survey does not independently validate their usefulness.

## 2. Scope and Definitions

- Initial destination: Astana. One Flutter/Dart codebase targets Android, iOS and web, with the same core workflows and a shared Supabase backend (D-01/D-05 resolved at scope level). Mobile is the primary client; the web UI adapts to desktop screens. No web-only product feature is required.
- An organizer is the trip's active owner. A participant is an active trip member; permissions depend on their role.
- A draft is a proposed itinerary not yet committed as the shared plan. A confirmation is an explicit user action, followed by authorization and version checks on the server.
- A budget is a whole-trip estimate in KZT for the entered traveler count, including configured accommodation, meals, activities and local travel estimates. It is not a booking quote or a guarantee of actual spending.
- Hard constraints determine feasibility (budget, dates, opening hours, valid places); soft preferences guide ranking (interests, trip type, votes). Unknown mandatory data must not be treated as zero cost or unrestricted availability.
- Viewing the saved plan offline is separate from editing and synchronizing changes offline. Offline editing is outside this proposed baseline.

Out of scope: in-app purchases/bookings/payments, flights/intercity transport planning, other destinations and store publication. Dynamic subgroup routing, crowd forecasting and model training are not required by this baseline.

## 3. Actors and Proposed Permissions

| Actor | Allowed behavior |
| --- | --- |
| Signed-out visitor | Sign in/register; no private trip access. |
| Owner/organizer | Read and edit the trip; manage membership; confirm itinerary changes; use collaboration and optional expense features. |
| Editor/participant | Read and edit the plan; vote, comment, chat, confirm permitted AI changes and record expenses. No ownership or membership administration. |
| Viewer | Read the trip and saved messages; no writes. This adopts the backend test baseline pending D-02. |
| Former member/outsider | No current access to private trip records, commands or subscriptions. |
| Registered community user | Read the feed and publish/report content without gaining access to private trips. |

Exactly one active owner must remain per trip. Historic membership may be retained for messages/financial records without retaining access. The client cannot grant access by hiding/showing buttons; the backend must enforce the same rules on all exposed paths.

## 4. Functional Requirements

IDs preserve the existing client/AI references to FR-06 (budget), FR-07 (map), FR-12 (assistant) and FR-18 (offline). Other numbering is established here and must be checked against future task mappings.

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| FR-01 | Must | Account access | A user can register/sign in and sign out using Supabase Auth on either client. Valid access succeeds; invalid credentials fail without exposing a private trip. Signing out clears the active session and private local cache according to the agreed policy. |
| FR-02 | Must | Create a trip | An authenticated user enters Astana, inclusive dates, positive integer traveler count, positive total KZT budget, trip type and interests. Invalid dates/values are rejected. Creation stores one trip and one active owner atomically. |
| FR-03 | Must | Generate a draft itinerary | From valid parameters and curated place data, the system returns ordered day entries with place IDs, proposed times/durations and estimated costs. Every trip day is represented. Infeasible input returns a useful explanation or incomplete draft, never a falsely valid plan. No saved plan is changed before confirmation. |
| FR-04 | Must | Curated places and accommodation | Recommended places resolve to catalog entries with category, coordinates, source and checked cost/opening information needed for validation. Accommodation costs reflect nights and traveler/room assumptions. Missing required data prevents a valid-budget label. No fabricated price or hotel ID is accepted. |
| FR-05 | Must | Edit and confirm an itinerary | Owners/editors can add, remove, replace or reorder entries. Preview shows affected dates, costs and constraints. Confirmation saves a valid version atomically. A stale concurrent edit is rejected with refresh/retry guidance; an invalid edit leaves the saved plan intact. |
| FR-06 | Must | Budget distribution and recalculation | The plan shows accommodation, day totals, whole-trip estimated total and remaining budget. A fixed fixture gives the expected exact total, with no double-counting of accommodation or per-person costs. Every valid confirmed plan is within its budget; missing estimates are visible and cannot count as zero. |
| FR-07 | Must | Map and route view | Switching between list/map displays the same selected day and saved itinerary version. Markers match catalog coordinates and visit order. Travel-time estimates identify their source. A provider error leaves the list usable and shows that route information is unavailable. |
| FR-08 | Must | Invite and manage participants | An owner can issue a controlled invitation; an authenticated recipient can accept it once to obtain the agreed role. Invalid/revoked/expired invitations cannot grant access. Duplicate acceptance does not duplicate membership. Removing a member revokes reads, writes and future private events while preserving required history. Token/storage/expiry design is pending D-06. |
| FR-09 | Must | Vote on plan items | An authorized owner/editor can set an upvote/downvote, change it or withdraw it. There is at most one current vote per user and itinerary item. Tallies match stored votes; retries do not add votes. Voting does not silently remove another member's choice or apply an AI change. |
| FR-10 | Must | Item comments | Authorized owners/editors can add nonempty comments to items of their trip. Comments retain actor/time and appear under the correct item. Cross-trip item references, impersonation and outsider writes are denied. |
| FR-11 | Must | Trip chat | Authorized owners/editors can send nonempty messages that are persisted once. Other active members can read history. After disconnect/reconnect, all committed messages are recovered without duplicate rendering. Outsiders and removed members cannot read or receive private messages. |
| FR-12 | Must | AI assistant with confirmation | An active authorized user can ask a trip question or request a change, such as “Make Day 2 cheaper.” Questions leave saved data unchanged. A change displays old/new items and budget impact; Cancel leaves the plan unchanged, and Confirm revalidates permission, constraints and version before saving. Credentials and other trips' data never enter the answer. |
| FR-13 | Should | Optional shared expenses | When enabled, authorized owners/editors can record one payer and participants' shares in the trip currency. Expense and shares commit together, sum exactly and reject cross-trip participants/negative amounts. Disabling the feature hides entry points without deleting history. Example: 10,000 KZT divided three ways is 3,333.33 + 3,333.33 + 3,333.34. Settlements/refunds need a separate agreed design. |
| FR-14 | Must | Community posts | A registered user can publish a post associated with a catalog place and read published posts. Public payloads include only deliberately published fields, never private trip members, chat, itinerary or expenses. Media/likes/saving need schema extension before implementation. |
| FR-15 | Must | Report inappropriate posts | A registered user can report a post, receive acknowledgment and avoid duplicate reports under the agreed rule. A defined reviewer can inspect reports and record a disposition; ordinary users cannot exercise moderation privileges. Reviewer role and report persistence are pending D-07. |
| FR-16 | Should | Weather-aware alternatives | Available weather data is labeled with source and forecast time. For a rainy test day, the system can propose an indoor replacement and show the change for confirmation. Missing/out-of-horizon forecasts are disclosed and do not block basic planning. |
| FR-17 | Should | Local events | An event can be proposed only when its known date/time overlaps the trip and its cost/availability can be handled by validation. Stale, canceled or unverified events are labeled or excluded. Absence of an event feed never produces an invented event. |
| FR-18 | Should | Read a saved plan offline | After an authorized online load and explicit caching, airplane mode permits viewing the saved day lists, costs and available place details with an offline/last-sync indicator. Online map tiles, AI, chat delivery and edits are not promised offline. Sign-out removes the private cache; revocation cannot be guaranteed while a device remains disconnected. |
| FR-19 | Should | External booking/map links | A place can open an available external booking/map URL after a user action. Missing URLs are handled clearly. The application does not create a reservation, collect payment or present a booking as confirmed. |

## 5. Non-functional Requirements

| ID | Priority | Acceptance criteria and verification |
| --- | --- | --- |
| NFR-01 | Must | End-to-end validated draft generation completes in under 30 seconds in at least 9 of 10 consecutive live-provider runs under the declared fixture/network. Start at submit; stop when the usable draft renders. Failures/timeouts count as unsuccessful runs. Report backend timings separately. |
| NFR-02 | Must | Proposed collaboration target: p95 sender-submit-to-receiver-render delay ≤3 seconds over 30 recorded updates with two authorized clients, declared network and dataset. Include failures; at least 29/30 deliveries must meet 3 seconds using nearest-rank p95. This numerical target needs approval (D-04). |
| NFR-03 | Must | All approved unauthorized read/write/subscribe tests deny private data, including guessed IDs, removed members and privileged command misuse; allowed controls still succeed. Reuse ACC-01–06 and relevant negative server cases. |
| NFR-04 | Must | Executed tests leave zero cross-trip references, duplicate votes/messages, partially saved commands or unbalanced expense totals. Monetary values use an exact representation; concurrency/version behavior is explicit. |
| NFR-05 | Must | After defined tasks, collect standard SUS scores from at least 10 consenting adult target users; proposed target is mean SUS ≥70/100. Report count, distribution, missing responses and study limitations. This is a project target, not a universal pass mark. |
| NFR-06 | Must | No privileged database key, AI credential, private provider secret or identifiable research data appears in tracked files or distributed client assets. Verify secret handling and redacted logs. Public client identifiers are constrained according to provider guidance. |
| NFR-07 | Must | The core scenario passes on recorded Android and iOS devices/emulators/simulators and in current desktop Chrome and Safari, all from the same Flutter project and shared Supabase project. Record exact builds, OS/browser versions and limits. A change made on web must be visible on mobile and vice versa; a wireframe is not a passing build. |
| NFR-08 | Should | User-facing navigation and core validation messages are available in English, Russian and Kazakh. Switching languages preserves trip data and displays dates/currency consistently. Missing translations are recorded as defects. |
| NFR-09 | Must | Every place ID in a draft labeled valid resolves to an eligible catalog entry; unknown IDs, unsupported prices and conflicting opening/time data are rejected. Test unknown IDs and incomplete fields, not just valid samples. |
| NFR-10 | Must | Provider/network failure preserves the latest confirmed itinerary, shows a recoverable error and never silently substitutes an invalid draft. Reconnection reloads authoritative state and deduplicates messages. |
| NFR-11 | Must | Every cost estimate used for budget validation has an explicit currency, unit (per person/group/night), included category and data source/check date. Incomplete costs are reported; an estimated-budget guarantee is never described as a guarantee of real-world prices. |
| NFR-12 | Must | Key trip, chat and feed screens fit 390 × 844 and 1280 × 800 layouts without clipped primary controls or page-level horizontal scrolling. Core web forms/navigation work by keyboard with visible focus and labeled inputs. Verify on declared browser/device targets. |

## 6. Data and Integration Constraints

The [11-table database design](database-design.md) is the starting model. It already anticipates trip-scoped keys, roles, versions, votes, message deduplication and expense shares. It does not yet implement the requirements. Before development, define invitation tokens/revocation, AI draft lifecycle, moderation/reporting, media, catalog freshness and accommodation estimates; add migrations and tests after review. Model each extension explicitly rather than implying that existing tables cover it.

All AI/provider calls requiring private credentials run in trusted execution. LLM output and retrieved external data are untrusted input. The server checks active membership, allowed operations, candidate IDs, schedule, cost and latest version before committing. A live subscription is a notification channel; the database remains the source of truth.

## 7. Traceability

| Requirements | Use cases | Components | Verification |
| --- | --- | --- | --- |
| FR-01–02, NFR-03/06/07 | UC-01/02 | Mobile client, Auth, Data API, trusted operations | UAT-01, ACC-01–06, platform/security checks |
| FR-03–07, NFR-01/04/09/10/11 | UC-03/04/05 | Planning UI, candidate selector, LLM gateway, budget/route code, validator, database, maps | UAT-02/03, ITN-01/02, AI-01–05, performance fixtures |
| FR-08–11, NFR-02/03/04 | UC-06/07/08 | Membership commands, database, REST, Realtime | UAT-04, ACC/VOT/CHT groups, collaboration timing |
| FR-12 | UC-09 | Assistant UI, trusted AI operations, validation/version checks | UAT-05, AI-01–05 |
| FR-13 | UC-10 | Expense UI, transactional expense operations | UAT-06, EXP-01–05 |
| FR-14/15 | UC-11 | Community UI, public data policies, proposed moderation service | UAT-07, ACC-06, moderation controls |
| FR-16/17/19 | UC-03/05/09 | Provider adapters, validator, external-link UI | UAT-08, missing/stale provider fixtures |
| FR-18 | UC-12 | Private local read cache | UAT-09, disconnect/sign-out checks |
| NFR-05/08 | All relevant use cases | Whole application | SUS, task timing and translation review |

UC specifications are in [architecture-and-use-cases.md](architecture-and-use-cases.md); UAT cases and protocols are in [verification-and-evaluation-plan.md](verification-and-evaluation-plan.md). ACC/VOT/ITN/CHT/EXP/AI IDs refer to the existing [server plan](server-testing-plan.md), which has not been executed.

## 8. Decisions Requiring Review

| ID | Conflict or open decision | Proposed review resolution | Owner(s) |
| --- | --- | --- | --- |
| D-01 | Platform scope — resolved for this draft on 22 October 2026. | Mobile Android/iOS plus web from one Flutter codebase; same core features and shared backend. Matches the updated proposal and user instruction. | Team scope; supervisor review pending |
| D-02 | Topic report permits participants to collaborate; backend adds read-only viewers. | Keep owner/editor collaboration; optional viewers are read-only. Confirm invitation default and rename UI roles consistently. | Zukhra, Yerassyl, Sayakhat |
| D-03 | AI design automatically saves initial generation; backend requires preview/confirmation. | Use preview/confirmation for initial generation and edits; update AI/UX documents after approval. | Zukhra, Sayakhat, Yerassyl |
| D-04 | “Few seconds” synchronization has no finalized threshold. | Review proposed ≤3-second p95 target, devices, concurrency and network before testing. | Zukhra, Yerassyl |
| D-05 | Backend selection — resolved at design level on 22 October 2026. | Supabase/PostgreSQL/Auth/REST/Realtime are selected by the team. Authorization, transactions and reconnect proof of concept remain implementation checks, not conditions for describing the choice as selected. | Yerassyl, team |
| D-06 | Invitations and AI draft state are outside the current ER model. | Define token lifecycle and versioned draft/confirmation contract before implementation. | Yerassyl, Sayakhat |
| D-07 | Community scope exceeds current schema and lacks reviewer role. | Approve minimal posts/report workflow and schema/role extensions; defer additional social features explicitly if needed. | All |
| D-08 | Catalog/price sources, event access and offline storage remain open. | Agree source/check-date policy and provider tests; do not promise verified local coverage before evidence exists. | All |

Review status: proposed; no team or supervisor approval is asserted. Add reviewer, date, decision and linked task/PR when review actually occurs.

## 9. Survey Traceability

The snapshot contains 15 submitted responses and is not representative of all target groups. Scores below express stated usefulness, not measured usability or adoption. See the [survey report](research/survey-results.md) for full counts, demographics and limits.

| Survey observation | Requirement consequence | Limit |
| --- | --- | --- |
| 14/15 selected agreeing where to go as a difficulty; 13/15 rated voting 4–5 | Preserve trip/item voting (FR-09) and visible discussion (FR-10) | No evidence that a specific voting implementation resolves conflict |
| 14/15 rated automatic day plans 4–5 | Preserve generation/editing (FR-03/05), grounded in checked candidates | Does not establish generation quality or <30-second performance |
| 7/15 selected staying within budget; 10/15 rated day-budget distribution 4–5 | Preserve explicit estimates/recalculation (FR-06, NFR-11) | Price-range answers are perceptions, not verified merchant prices |
| 12/15 rated expense calculation 4–5, while two rated it 1 | Keep optional expense activation (FR-13) | No claim that every family/friend group needs detailed accounting |
| 7/15 rated AI plan changes 5; six rated them 3 | Provide transparent preview/confirmation (FR-12); measure actual usefulness | Mixed response does not establish universal demand |
| Chat/feed were not directly rated | Retain FR-11/14/15 as confirmed team scope and evaluate later | Do not present them as survey-validated features |
