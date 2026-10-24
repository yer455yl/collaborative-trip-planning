# Collaborative Trip Planning

Diploma project: **Development of a Mobile Application for Collaborative Trip Planning**. Astana IT University, Software Engineering. Supervisor: **Aigerim Kydyrbekova**. First pre-defense: **24 October 2026**. Status revised **23 October 2026** after supervisor feedback.

The proposed application helps groups plan a trip to Astana using a shared, budget-aware itinerary. The [five-function MVP revision](docs/mvp-scope-and-responsibilities.md) narrows earlier feature promises and gives all three members concrete implementation responsibilities. This branch is prepared for teammate review; it does not claim approval of every detailed role or platform decision.

**Current state:** analysis/design documents and static wireframes, plus an initial standalone Dart budget-calculation module with executed deterministic checks. There is no complete runnable Flutter application, deployed backend or executed end-to-end, model-performance or SUS study. The initial module is not a completed itinerary planner.

## Server implementation update — 24 October 2026

Yerassyl has added an executable local [Supabase migration/RLS/RPC and Edge-handler increment](supabase/README.md), with [verification evidence and remaining hosted checks](docs/server-implementation-evidence.md). A real Supabase project has not yet been created; local checks are not deployment or end-to-end product acceptance. All platforms and the five-function scope remain unchanged. Earlier status paragraphs describe the preceding design baseline.

## Problem, users and expected outcomes

Group trip planning spreads dates, place choices, costs and decisions across maps, sites and conversations. The project investigates whether a shared itinerary with explicit budget estimates and voting can support that workflow. The initial users are friends, families, couples and budget-conscious travelers visiting Astana. Business travelers are an additional proposed group, not validated by the small survey.

The [15-response survey report](docs/research/survey-results.md) separates observed counts from assumptions. Its [candidate places](docs/research/resident-place-candidates.md) are research leads, not a verified production catalog. No interviews, measured time savings or product usability results are invented. The [integrated literature review](docs/literature-review.md) records sources and access/reading limits.

The expected diploma outcome is a tested core workflow: create a trip → generate and validate a draft → confirm → inspect budget/map → edit together and vote. It must be evaluated against declared correctness, timing, usability and manual-planning baselines. Current artifacts are steps toward that outcome, not evidence that it is achieved.

## Five mandatory product functions

| Function | Intended behavior |
| --- | --- |
| Create a trip | Enter Astana dates, traveler count, interests and planned budget; reject invalid values. |
| Generate an itinerary | Use eligible catalog places and an AI adapter; validate a draft and require confirmation. |
| Budget the plan | Show sourced daily/category/whole-trip estimates and remainder; recalculate after edits. |
| Map | Show the same day, place order and version as the itinerary; disclose routing failures. |
| Collaborative planning | Controlled invitations, shared editing and one current vote per participant/item; reject stale or unauthorized writes. |

Authentication, curated data and server-enforced validation support these five functions. **Deferred Could features:** item comments, chat, social feed/moderation, conversational AI editing, actual expense splitting, weather/events, offline access and booking links. Planned-budget arithmetic is distinct from recording payments and debts.

Astana is the initial destination. In-app booking/payments, flights/intercity transport and app-store publication remain outside the core. Existing Flutter Android/iOS/web targeting is retained until an explicit team decision changes the build matrix; feature reduction does not silently remove a client. Intended additional interface languages are English, Russian and Kazakh, subject to staged priorities.

## Team and technical responsibilities

| Member and account | Primary planned engineering ownership |
| --- | --- |
| **Kabysheva Zukhra Yerzhankyzy**, SE-2409, [Zukhra2409](https://github.com/Zukhra2409) | Trip input/validation, budget and constraints module, itinerary editor and recalculation, planning/voting controls and their tests. Requirements/research/report integration are additional responsibilities. Initial Dart arithmetic/preview core exists; Flutter modules remain planned. |
| **Aman Yerassyl**, SE-2401, [yer455yl](https://github.com/yer455yl) | Supabase, data schema/migrations, identity/RLS, invitations, server persistence and versioned commands, synchronization, voting integrity and backend tests. Existing schema/design work retains its authorship. |
| **Shauzat Sayakhat Anarbekuly**, SE-2431, [shauzatov](https://github.com/shauzatov) | Flutter shell/navigation, AI generation/candidate integration, day-plan/map views and provider integration tests; client/proposal/UX/risk alignment and supervisor coordination. |

Balance is judged by substantive engineering scope and evidence, not identical task/commit counts. The detailed split requires teammate review. Each member uses their own identifiable account; earlier contributions are never reassigned retroactively.

## Technologies and decisions

| Area | Selected design | Open work |
| --- | --- | --- |
| Clients | Flutter / Dart, one codebase | Implement and record the agreed device/browser build matrix. |
| Backend | Supabase, PostgreSQL, Auth, RLS, HTTPS API, Realtime | Migrations, trusted commands, policies, deployment and runtime checks. |
| Generation | Cloud LLM with curated candidate data and independent code validation | Select provider/model; measure quality, latency and cost. |
| Maps | Google Maps Platform | Verify access, Astana data, routing, quotas and cost; 2GIS is a fallback candidate. |

Compared alternatives remain documented: React Native/native Kotlin+Swift; Firebase/custom Node.js+PostgreSQL; managed listeners/REST/custom WebSocket; self-hosted models/rules; 2GIS/Mapbox. Weather/event providers and offline libraries are deferred decisions, not selected dependencies. GitHub and YouTrack support traceability; editable diagrams use draw.io.

## Documentation and scope alignment

The reduced [MVP decision](docs/mvp-scope-and-responsibilities.md), [requirements](docs/requirements-specification.md), [overall architecture/use cases](docs/architecture-and-use-cases.md) and [evaluation](docs/verification-and-evaluation-plan.md) define this branch's core. Older Word source descriptions and backend views still need their owners' alignment; extra mockups/tables remain historical or deferred design, not mandatory product promises.

| Material | Link |
| --- | --- |
| Supervisor comments and prepared response | [supervisor-feedback.md](docs/supervisor-feedback.md) |
| Initial budget core contract and remaining work | [planning-budget-module.md](docs/planning-budget-module.md) |
| Project proposal and topic | [project-proposal.docx](docs/project-proposal.docx), [topic-report.docx](docs/topic-report.docx) |
| Literature | [integrated review](docs/literature-review.md), [Zukhra](docs/literature/zukhra-literature-review.md), [Yerassyl](docs/literature/yerassyl-literature-review.md), [Sayakhat](docs/literature-review-sayakhat.docx) |
| Comparisons | [existing systems](docs/existing-system-comparison.docx), [client/AI/maps](docs/technology-comparison-client-ai.docx), [backend](docs/backend-technology-comparison.md) |
| Schema/backend | [database](docs/database-design.md), [alignment](docs/schema-alignment.md), [inventory](config/schema-design.json), [backend design](docs/backend-component-design.md) |
| Diagrams | [editable sources and PNG index](diagrams/README.md) |
| AI and UX | [AI design](docs/ai-module-design.docx), [screen descriptions](docs/ux-screen-descriptions.docx), [static PNGs](docs/ux/) |
| Verification | [MVP plan](docs/verification-and-evaluation-plan.md), [server case contribution](docs/server-testing-plan.md) |
| Management | [risks/milestones](docs/project-management-and-risks.docx), [handoff](docs/team-handoff.md), [Zukhra index](docs/zukhra-pre-defense-submission.md) |

## Structure

```text
src/planning_core/       # Initial dependency-free Dart budget core
examples/               # Synthetic executable budget example
tests/planning_core/     # Deterministic core checks
config/                 # Logical schema inventory; no deployed secret config
docs/                   # Research, requirements, design, review and evaluation
diagrams/               # Editable draw.io sources and generated PNG previews
scripts/                # Existing schema rendering helper
```

No Flutter app manifest or database deployment is implied. Provider keys and participant-level survey data must not enter Git.

## Run the initial budget core

Install/use a Dart SDK. These files were checked with **Dart 3.11.3** on macOS arm64 and require no external packages. From the repository root:

```sh
dart analyze src/planning_core tests/planning_core examples/budget_preview.dart
dart run tests/planning_core/budget_test.dart
dart run examples/budget_preview.dart
```

Observed 23 October: analyzer clean; **34/34 deterministic checks passed**. Synthetic example: estimated 7,500 KZT, remaining 2,500 KZT. These checks cover the local arithmetic/preview contract, not actual prices, Flutter UI, database/RLS, model generation, map routing or whole-product acceptance. Test counts are execution evidence, not a claimed amount of individual effort.

## Tracking and submission

[YouTrack board](https://dip-trip-planner.youtrack.cloud/agiles/204-1/current). Initial budget code: [DIP-42](https://dip-trip-planner.youtrack.cloud/issue/DIP-42). Scope/requirements, Use Case, overall components and evaluation relate to DIP-15/16/18/22; the real feedback response relates to DIP-24. New implementation tasks need owner, date, outcome and acceptance criteria; no planned UI/backend feature is closed merely because a document exists.

Use task branches, descriptive task-prefixed commits and teammate-reviewed PRs. Add commit/PR links to tasks. The existing `prob-period-1` tag identifies the earlier snapshot and must not be moved or silently reused for this revision. Final integration, source-document alignment, task evidence, report regeneration and the submission version require team review. The supplied supervisor chat confirms **24 October 2026, 18:00 Asia/Almaty** for the form. The user submits it.
