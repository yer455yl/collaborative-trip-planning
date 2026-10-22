# Collaborative Trip Planning

**Diploma project:** Development of a Mobile Application for Collaborative Trip Planning  
**University:** Astana IT University · Software Engineering  
**First pre-defense:** 24 October 2026  
**Status updated:** 22 October 2026

A proposed cross-platform mobile application (Android and iOS) with a web version built from the same codebase that helps travelers create a personalized, budget-aware, day-by-day itinerary and plan a trip together. The initial destination is **Astana, Kazakhstan**. The intended product combines an itinerary and map, group decisions, optional expense splitting, and an AI assistant that proposes changes for user confirmation.

**Current stage: analysis and design.** This repository contains project documents, preliminary research, architecture diagrams and a proposed server test plan. It does not yet contain a runnable application, a deployed backend or executed application test results. Features below describe intended functionality.

## Problem Statement

Planning a group trip requires coordinating places, dates, preferences and spending across maps, travel websites and messenger conversations. Suggestions can be lost in chat, group decisions can be difficult to track, and estimating daily costs or dividing shared expenses adds further work.

The project aims to bring these activities into one workflow using locally relevant information about Astana. Its proposed value is the combination of budget-aware planning, collaboration and local content. The extent of these needs, and the usefulness of the proposed solution, must be established through user research and evaluation. Existing-system comparisons are preliminary and do not establish that a feature is absent merely because a source does not mention it.

## Target Users

- Groups of friends organizing a weekend trip or vacation.
- Families with children who need suitable activities and a predictable budget.
- Couples seeking a convenient shared itinerary.
- Students and other travelers with limited budgets.
- Business travelers with limited time for local activities.

A Russian/Kazakh survey snapshot contains 15 submitted responses, inspected on 22 October 2026. The [survey report](docs/research/survey-results.md) separates observed counts from assumptions and provides [resident-suggested place leads](docs/research/resident-place-candidates.md). These are preliminary self-reports from a small sample, not representative population findings or a verified places database. Interviews are not used as evidence in this submission.

## Aim and Expected Outcomes

The aim is to design, implement and evaluate a mobile application with a web version that generates a personalized itinerary for Astana and supports collaborative planning within a defined budget.

Expected deliverables are an Android/iOS test application and a web version with a shared backend, a curated Astana places catalog, the implemented planning and collaboration workflows, and evaluation results supported by test evidence. Requirements, architecture, research and technical documentation form part of the diploma deliverables.

### Planned Features

| Area | Intended functionality |
| --- | --- |
| Accounts and trips | Sign in; create a trip with dates, traveler count, total budget, interests and trip type. |
| Itinerary generation | Generate a day-by-day plan with accommodation suggestions, meals, attractions and relevant events. |
| Budget planning | Distribute estimated costs across days and recalculate them when the plan changes. |
| Map | Display places, visit order, routes and travel-time information. |
| Collaboration | Invite participants by link or code; share itinerary updates, vote, comment and use trip chat. |
| Shared expenses | Optionally record payments, allocate shares and display balances. |
| AI assistant | Answer trip questions and propose validated changes with their budget impact; apply changes after user confirmation. |
| Community | Publish place-related posts and reviews, view others' experiences and report inappropriate content. |
| Context and offline access | Consider weather and local events; open external booking/map links; view a saved itinerary offline. |

The [requirements specification](docs/requirements-specification.md) assigns priorities and acceptance criteria to these features; team review remains pending. Optional expense splitting and later integrations must not be treated as completed implementation.

## Scope

### Diploma Product

- Astana as the initial destination, with curated places and local recommendations.
- One Flutter codebase targeting Android, iOS and the web; mobile builds distributed as test builds and the web version deployed to a test address.
- Itinerary generation, editing, budget estimates, map and collaborative planning.
- AI assistance, optional expense splitting, community content, weather/events and offline access, delivered in stages according to agreed priorities.
- Intended interface languages: English, Russian and Kazakh.

### Outside the Current Proposal

- Destinations beyond Astana and international trips; expansion to other Kazakhstan cities is future work.
- In-app booking, payments, flights and intercity transport planning.
- Publication in the App Store or Google Play.

**Platform decision:** the team confirmed a mobile application (Android and iOS) as the primary client and a web version built from the same Flutter codebase and sharing the same backend. The [project proposal](docs/project-proposal.docx), [topic report](docs/topic-report.docx), [client technology comparison](docs/technology-comparison-client-ai.docx) and [UX descriptions](docs/ux-screen-descriptions.docx) were updated accordingly; the [requirements specification](docs/requirements-specification.md) covers both clients.

The first pre-defense concerns analysis, design and planning. A complete application is not required at this stage.

## Team and Supervisor

| Team member | Responsibilities |
| --- | --- |
| **Kabysheva Zukhra Yerzhankyzy** ([Zukhra2409](https://github.com/Zukhra2409)) | User research; requirements and acceptance criteria; application structure and overall integration; core planning and budget logic; verification, technical documentation and README; literature on recommendations and collaborative planning. |
| **Aman Yerassyl** ([yer455yl](https://github.com/yer455yl)) | Backend, database and API; repository organization; backend technology comparison; system context, database and backend component design; server testing; literature on itinerary optimization and backend technologies. |
| **Shauzat Sayakhat Anarbekuly** ([shauzatov](https://github.com/shauzatov)) | Mobile interface, UX mockups and map; AI generation and assistant; client/AI/maps technology comparison; project coordination, YouTrack, supervisor communication and risk management. |

**Supervisor:** Aigerim Kydyrbekova, Astana IT University.

Integration, testing, review and bug fixing are shared responsibilities. These roles describe ownership of work, not completion of every assigned deliverable.

## Technologies and Decision Status

### Selected in the Client/AI Design

The [client, AI and maps comparison](docs/technology-comparison-client-ai.docx) records these choices for implementation. They have not yet been validated in a working application.

| Area | Documented choice | Validation still needed |
| --- | --- | --- |
| Mobile and web clients | **Flutter / Dart** | Create the application and verify required packages and Android, iOS and web builds. |
| AI approach | **Cloud LLM API + curated places + budget, route and validation code** | Select a provider/model and evaluate quality, latency and cost. |
| Map and routing | **Google Maps Platform** | Verify API access, Astana coverage, required data, quotas and cost. |

### Selected Backend, Implementation Verification Pending

The team confirmed **Supabase with PostgreSQL, Auth, Row Level Security, REST over HTTPS and managed Realtime subscriptions** as the selected design baseline on 22 October 2026. The [backend comparison](docs/backend-technology-comparison.md) records the rationale and earlier recommendation. Trusted operations handle AI credentials and transactional validation. Selection does not establish implementation: no deployment or proof-of-concept results are present, and authorization/reconnect/transaction checks remain required.

### Alternatives and Open Decisions

| Area | Alternatives or unresolved choice |
| --- | --- |
| Client framework | React Native; native Kotlin and Swift, compared with Flutter. |
| Backend | Firebase Authentication/Firestore; a custom Node.js API with PostgreSQL, compared with Supabase. |
| Communication | Managed listeners, REST and custom WebSocket delivery; a custom WebSocket service is deferred in the proposed architecture. |
| AI | Self-hosted open-source models and a rule-based approach; the cloud provider/model remains undecided. |
| Maps | 2GIS as a fallback; Mapbox as a compared alternative. |
| Weather and events | Providers, reliable Astana coverage and collection/update methods remain to be agreed. |
| Offline storage | Hive or SQLite are examples in the topic report; no library or synchronization implementation has been selected. |

Git/GitHub are used for version control and pull requests; diagrams.net/draw.io files hold editable diagrams. YouTrack is the designated task tracker. Wireframe mockups are published as PNG files in `docs/ux/`; a clickable Figma prototype is not yet published; aggregated survey evidence is available in `docs/research/`.

## Proposed Architecture

The intended system consists of mobile and web clients built from one codebase, shared backend/database, trusted AI operations and external map, weather and event integrations.

The AI design uses stored place candidates rather than accepting arbitrary model-generated places. Code is responsible for checking estimated costs, opening hours and schedule feasibility. AI output is a draft; the backend must validate it and obtain user confirmation before applying changes to the saved itinerary. Provider credentials remain server-side.

The initial relational model contains 15 application tables: `users`, `trips`, `participants`, `places`, `plan_items`, `votes`, `comments`, `chat_messages`, `posts`, `expenses`, `expense_splits`, `events`, `invitations`, `ai_proposals` and `post_reports`. It is a proposed logical model, without SQL migrations or deployed access policies. See [schema alignment](docs/schema-alignment.md) for draft/invitation lifecycle, public-content rules and review limits. Full AI conversation history remains deferred.

See the [diagram index](diagrams/README.md), [database design](docs/database-design.md) and [backend component design](docs/backend-component-design.md). The component view covers the backend contribution; the [overall component view and use cases](docs/architecture-and-use-cases.md) integrate both clients, the backend contribution and providers. Detailed role, draft lifecycle and schema-extension policies remain under review.

## Current Status and First Pre-defense Readiness

Status below reflects `main` at `fcd1ec2` on **22 October 2026** plus the documentation in this submission. A document's presence does not mean that its acceptance criteria or review requirements have been satisfied.

| Deliverable | Repository evidence and remaining work |
| --- | --- |
| Proposal and topic report | Present in `docs/`; platform scope confirmed (mobile and web); requirements prepared for review. |
| Existing-system comparison | Five systems and eight criteria documented; first screenshots of similar AI planners are in [docs/evidence/](docs/evidence/); screenshots of generated plans for Astana are still pending. |
| Technology comparisons | Client/AI/maps and backend comparisons present; selected Supabase still requires implementation proof of concept; API coverage remains to be checked. |
| Literature | [Integrated review](docs/literature-review.md) combines all three contributions: 13 scientific publications and two technical sources. Source-access/reading limits and remaining substantive review are explicit; a bibliography count is not approval. |
| User research | [Survey results](docs/research/survey-results.md), aggregate counts, feature-rating figure and candidate-place list cover a 15-response snapshot. No interviews or synthetic responses are used as research evidence. Place details remain to be verified. |
| Requirements | [Specification](docs/requirements-specification.md) provides 19 functional and 12 non-functional requirements, priorities, acceptance criteria, cross-client coverage and a decision register. Detailed policies remain subject to review. |
| Architecture | The ER revision models 15 application tables with trip preferences, events, invitations, AI proposals and place-linked feed/reporting. Existing context/backend/ER views are complemented by editable [Use Case](diagrams/use-case.drawio) and [overall Component](diagrams/overall-components.drawio) sources and PNG previews. They cover mobile + web, selected Supabase, chat/feed, AI and provider boundaries. Team review remains pending. |
| UX/prototype | Screen/scenario descriptions are in [docs/ux-screen-descriptions.docx](docs/ux-screen-descriptions.docx); black-and-white wireframes of 13 mobile screens and 3 web screens are in [docs/ux/](docs/ux/) (overview: [ux-overview-mobile.png](docs/ux/ux-overview-mobile.png)). The wireframes are static, not a clickable prototype. |
| Verification | [Overall plan](docs/verification-and-evaluation-plan.md) incorporates 32 server cases and ten end-to-end scenarios, cross-client checks, generation/budget/SUS targets, measurement conditions and a manual baseline. No application tests or SUS study have been run. |
| Management and supervision | Roles, milestones and risks are documented. Supervisor feedback and a comment-to-action record are not published in the repository. |
| Implementation | `src/` and `tests/` contain placeholders; `config/` includes the logical schema inventory. No runnable project, dependency manifest, database migrations or CI workflow is present. |
| Submission | Contributions remain traceable through task branches, commits and pull requests. The submission tag follows the complete team review; this documentation update does not approve a release or close unrelated tasks. |

The backend handoff and personal checklist were refreshed for the schema revision. Use Git history for merge status; checked design deliverables do not mean implemented or tested behavior.

See the [22 October readiness review](docs/readiness-review-22-october.md) for verified artifacts, corrections and remaining submission evidence.

## Documentation

Links below resolve from this README at the repository root.

| Document | Location |
| --- | --- |
| Project proposal and scope | [project-proposal.docx](docs/project-proposal.docx) |
| Project topic report and initial requirements | [topic-report.docx](docs/topic-report.docx) |
| Existing-system comparison | [existing-system-comparison.docx](docs/existing-system-comparison.docx) |
| Client, AI and maps technology comparison | [technology-comparison-client-ai.docx](docs/technology-comparison-client-ai.docx) |
| Backend and communication technology comparison | [backend-technology-comparison.md](docs/backend-technology-comparison.md) |
| Preliminary literature contribution — Yerassyl | [yerassyl-literature-review.md](docs/yerassyl-literature-review.md) |
| Requirements and acceptance criteria | [requirements-specification.md](docs/requirements-specification.md) |
| Integrated literature review | [literature-review.md](docs/literature-review.md) |
| Literature contribution — Zukhra | [zukhra-literature-review.md](docs/literature/zukhra-literature-review.md) |
| Overall architecture and use cases | [architecture-and-use-cases.md](docs/architecture-and-use-cases.md) |
| Overall verification and evaluation | [verification-and-evaluation-plan.md](docs/verification-and-evaluation-plan.md) |
| Resident survey and candidate places | [survey-results.md](docs/research/survey-results.md) · [candidate list](docs/research/resident-place-candidates.md) |
| Zukhra submission/task index | [zukhra-pre-defense-submission.md](docs/zukhra-pre-defense-submission.md) |
| AI module design | [ai-module-design.docx](docs/ai-module-design.docx) |
| Database design | [database-design.md](docs/database-design.md) |
| Backend component responsibilities and workflows | [backend-component-design.md](docs/backend-component-design.md) |
| Proposed server verification and evaluation plan | [server-testing-plan.md](docs/server-testing-plan.md) |
| Project management, milestones and risks | [project-management-and-risks.docx](docs/project-management-and-risks.docx) |
| Diagram sources and previews | [diagrams/README.md](diagrams/README.md) |
| Backend handoff and remaining contribution tasks | [team-handoff.md](docs/team-handoff.md) · [yerassyl-checklist.md](docs/yerassyl-checklist.md) |
| Literature contribution — Sayakhat (LLMs for travel planning, AI acceptance) | [literature-review-sayakhat.docx](docs/literature-review-sayakhat.docx) |
| UX key screens and scenarios | [ux-screen-descriptions.docx](docs/ux-screen-descriptions.docx) |
| UX wireframes (13 mobile + 3 web screens) | [docs/ux/](docs/ux/) · [overview](docs/ux/ux-overview-mobile.png) |
| Evidence: screenshots of similar applications | [docs/evidence/](docs/evidence/) |

## Repository Structure

```text
.
├── README.md
├── .gitignore
├── src/                                  # Application placeholder
├── tests/                                # Automated-test placeholder
├── config/                               # Configuration placeholder
├── docs/
│   ├── requirements-specification.md
│   ├── architecture-and-use-cases.md
│   ├── verification-and-evaluation-plan.md
│   ├── literature-review.md
│   ├── literature/                         # Individual scientific contributions
│   ├── ux/                                 # Mobile/web wireframe PNGs
│   ├── evidence/                           # Existing-system evidence
│   ├── project-proposal.docx
│   ├── topic-report.docx
│   ├── existing-system-comparison.docx
│   ├── technology-comparison-client-ai.docx
│   ├── ai-module-design.docx
│   ├── project-management-and-risks.docx
│   ├── literature-review-sayakhat.docx
│   ├── ux-screen-descriptions.docx
│   ├── backend-component-design.md
│   ├── backend-technology-comparison.md
│   ├── database-design.md
│   ├── server-testing-plan.md
│   ├── team-handoff.md
│   ├── yerassyl-checklist.md
│   ├── yerassyl-literature-review.md
│   └── research/                           # Aggregated survey findings and place candidates
└── diagrams/
    ├── README.md
    ├── use-case.drawio                     # Two editable use-case pages
    ├── use-case.png
    ├── use-case-core.png
    ├── use-case-collaboration.png
    ├── overall-components.drawio
    ├── overall-components.png
    ├── system-context.drawio
    ├── system-context.png
    ├── backend-components.drawio
    ├── backend-components.png
    ├── database-er.drawio                # Three editable pages
    ├── er-membership-expenses.png
    ├── er-itinerary-voting.png
    └── er-communication-community.png
```

Placeholder directories are retained with `.gitkeep` files.

## Verification and Evaluation

The [overall evaluation plan](docs/verification-and-evaluation-plan.md) incorporates the [server testing plan](docs/server-testing-plan.md), which proposes checks for authorization, membership, voting, concurrent itinerary edits, chat persistence/recovery, expense integrity and validated AI changes. Its cases are **not run**.

The intended overall evaluation includes:

| Measure | Proposed target or method |
| --- | --- |
| Plan generation time | AI design target: under 30 seconds in 9 of 10 runs; align measurement conditions with the server benchmark protocol. |
| Budget compliance | Every draft labeled valid must fit the entered budget using complete, documented cost estimates; real-world price accuracy needs separate evaluation. |
| Collaborative update delay | Measure delivery of saved changes across devices; agree on a numerical threshold before execution. |
| Usability | System Usability Scale (SUS) target of at least 70 after defined user tasks. |
| Planning effort | Compare task completion time against manual planning with Google Maps and a group chat. |

These are targets and planned methods, not measured achievements. Test conditions, datasets, requirement coverage, failures and limitations must be recorded in the final evaluation report.

## Project Tracking and Contribution Workflow

**YouTrack:** [Collaborative Trip Planning board](https://dip-trip-planner.youtrack.cloud/agiles/204-1/current). Access requires the appropriate project permissions. Task assignments, priorities and completion status must be verified in YouTrack.

**README task:** [DIP-2 — Write README](https://dip-trip-planner.youtrack.cloud/issue/DIP-2).

1. Create or use a real YouTrack task with an owner, deadline, expected outcome and acceptance criteria.
2. Work in a separate branch containing the task ID, and include the ID in the commit message and pull request.
3. Submit a focused pull request describing the change, related task and verification evidence.
4. Obtain another team member's review before merging into `main`.
5. Link the pull request or commit from the YouTrack task. Mark it complete only when its acceptance criteria are met.
6. After checking the complete submission package, tag its exact commit as `pre-defense-1`. Preserve that tag when development continues.

Each member contributes through their own identifiable account. Do not commit passwords, API keys or identifiable survey/interview data; publish aggregated research findings only. Supervisor and committee access must be verified before submission.

## Running the Project

There is no runnable application or automated test suite in the current baseline. Dependency versions, environment setup, execution and test commands will be documented when the corresponding code and configuration are committed. The existing documents and diagrams can be reviewed without an application runtime.
