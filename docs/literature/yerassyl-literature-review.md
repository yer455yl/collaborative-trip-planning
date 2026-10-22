# Itinerary Optimization and Collaborative Backend Literature Review

Contribution: Aman Yerassyl. Claim verification updated on 22 October 2026. Scope: Flutter mobile and web with the selected Supabase backend. This review contains three scientific publications and two technical sources. It is part of the [integrated team review](../literature-review.md), which counts preprint/journal versions once and excludes technical documentation from its scientific-publication count.

## Scientific Publication Analysis

| Source | Approach and verified findings | Limitations | Project relevance |
| --- | --- | --- | --- |
| **L-05. Ruiz-Meza, J., & Montoya-Torres, J. R. (2022).** A systematic literature review for the tourist trip design problem: Extensions, solution techniques and future research lines. *Operations Research Perspectives, 9*, 100228. [DOI](https://doi.org/10.1016/j.orp.2022.100228) | Systematic TTDP taxonomy covering 102 documents, including several publication types. Search cutoff: 15 February 2021. Classifies objectives, variants and exact/heuristic/metaheuristic methods; Orienteering Problem formulations are prominent. | A review of earlier work, not a comparative benchmark of our app or a survey of all research through 2026. | Separate place selection from ordering and define time, budget and preference constraints before choosing an optimizer. |
| **L-06. Adamo, T., Colizzi, L., Dimauro, G., Ghiani, G., & Guerriero, E. (2024).** A multi-modal tourist trip planner integrating road and pedestrian networks. *Expert Systems with Applications, 237*, Part B, 121457. [DOI](https://doi.org/10.1016/j.eswa.2023.121457); [2022 author preprint](https://arxiv.org/abs/2207.00097) | Walk-and-drive itineraries with time windows; iterated local search and constant-time feasibility checks for specified moves. Preprint experiments use Apulia networks and up to 3,643 POIs. Preprint Table 7 reports setting-dependent times, including 60-second runs. | The constant-time claim concerns particular feasibility operations, not complete plan generation. Preprint table numbering/results must not be attributed to the journal version without comparison. No Astana or LLM latency guarantee. | Validate travel/visit times and opening hours; benchmark our complete pipeline separately. |
| **L-07. Hu, Y., Fang, Z., Zou, X., Zhong, H., & Wang, L. (2023).** Two-Stage Tour Route Recommendation Approach by Integrating Crowd Dynamics Derived from Mobile Tracking Data. *Applied Sciences, 13*(1), 596. [DOI](https://doi.org/10.3390/app13010596) | Crowd-aware global optimization followed by local updates using INSGA-II. In Dalian, 27 of 58 initial routes were adjusted; Table 6 reports a mean 7% reduction in real-time crowding among adjusted routes. | This is a particular adjustment experiment, not a 7% improvement over every baseline or proof of better usability. Group preferences and real-user evaluation remain future directions in Section 6. | Local revalidation after a user edit is our adaptation. We do not claim crowd forecasting without suitable Astana data. |

## Synthesis for the Proposed System

Feasible itinerary generation needs both candidate selection and ordering under explicit constraints. Our design uses catalog-backed IDs and deterministic budget/schedule checks around AI-generated proposals. Literature motivates this separation; it does not prove our implementation correct or fast.

A saved itinerary is shared state. Preview, explicit confirmation, version checks and active-member authorization are our engineering choices, specified in the [schema contract](../schema-alignment.md) and [server plan](../server-testing-plan.md). None of the routing papers establishes the correctness of chat, financial transactions or access policies.

Wanderlog is a product reference for the team's planning experience. The academic sources need not mention it. No claim is made about Wanderlog's internal algorithms, database or hosting. Product comparison evidence belongs in the existing-system comparison rather than the scientific-source count.

## Technical Sources

| Source | Verified mechanism and relevance | Limits |
| --- | --- | --- |
| **T-01. Supabase.** [Realtime Architecture](https://supabase.com/docs/guides/realtime/architecture), checked 22 October 2026 | WebSocket delivery, Broadcast/Presence and PostgreSQL change streaming. Relevant to notifying clients after authorized persistence. | Vendor documentation, not independent comparative evidence or a latency guarantee. Managed notifications do not replace durable chat history, explicit access policies or reconnect checks. |
| **T-02. Firebase.** [Get realtime updates with Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/listen), checked 22 October 2026 | Document listeners provide an initial snapshot and subsequent updates. Relevant as a comparison alternative. | Firestore is not the selected backend. SDK examples and listener semantics do not prove relational integrity or application security. |

The selected Supabase design is justified separately in the [backend comparison](../backend-technology-comparison.md). Platform selection is complete at design level; implementation verification remains pending.

## Verification Record and Personal Reading

The [source verification and reading guide](yerassyl-source-verification.md) records accessible copies, exact sections, corrected interpretations and questions for the contributor. Relevant full-text sections were inspected for the claims above. Algorithms and experiments were not independently reproduced, and no exhaustive mathematical proof audit is claimed.

Editorial/source verification and the contributor's personal reading are separate. Personal reading is still awaiting the contributor's confirmation; do not infer it from this file or mark it complete automatically. Once reading, corrections and required team review are finished, attach the accepted commit/PR to DIP-10 and set its status according to the task's acceptance criteria. No application implementation is required to complete this literature task.
