# Source Verification and Reading Guide

Checked 22 October 2026. Scope: the three scientific and two technical sources in [Yerassyl's review](yerassyl-literature-review.md). This record verifies cited claims; it does not certify the contributor's personal reading or reproduce research experiments.

## Access and Section Record

| Source | Material inspected | Read these sections personally |
| --- | --- | --- |
| L-05 | Publisher metadata/search-method text and [author-hosted full PDF](https://www.researchgate.net/profile/Jose-Ruiz-Meza/publication/358317797_A_systematic_literature_review_for_the_tourist_trip_design_problem_Extensions_solution_techniques_and_future_research_lines/links/6203966053fa31414829b049/A-systematic-literature-review-for-the-tourist-trip-design-problem-Extensions-solution-techniques-and-future-research-lines.pdf): Sections 2–4 and the search-cutoff passage | Sections 2–3, classification in Section 4, discussion/conclusion in Sections 5–6. Use section headings rather than PDF viewer page offsets. |
| L-06 | [Author preprint v2 full HTML](https://arxiv.org/html/2207.00097v2): Sections 2–5 and 7, including Table 7. Journal bibliographic identity checked against the [author institutional publication list](https://serlab.di.uniba.it/dimauro/pdf/Pubblicazioni.pdf). | Sections 2–3, the meaning of feasibility checks in Section 4, update example in Section 5, experimental setup/Table 7 in Section 7 and conclusion. This is the 2022 preprint; the cited journal issue is 2024. |
| L-07 | Publisher-indexed text cross-checked against the publisher-provided full text on [ResearchGate](https://www.researchgate.net/publication/366796077_Two-Stage_Tour_Route_Recommendation_Approach_by_Integrating_Crowd_Dynamics_Derived_from_Mobile_Tracking_Data): methodology, adjustment strategy, Table 6 and Section 6. Direct MDPI requests were rate-limited. | Section 3, especially the two-stage strategy; the case study; evaluation/Table 6; Section 6. Read the article text, not the unrelated citing-paper excerpts below it. |
| T-01 | [Official architecture page](https://supabase.com/docs/guides/realtime/architecture): Channels, Global cluster, Connecting to a database and WAL streaming | Explain which state is durable and how authorized clients recover after a disconnect. |
| T-02 | [Official listener guide](https://firebase.google.com/docs/firestore/query-data/listen): initial snapshot/subsequent updates and platform examples | Explain why this is comparison evidence rather than the project's selected platform. |

The full-text access issue for L-07 is resolved for the inspected claims through a publisher-provided copy. Direct-host availability may vary. L-06 numerical claims remain explicitly tied to the preprint; a complete journal/preprint difference audit is not asserted.

## Corrections Applied

- Distinguish publication year from preprint year and identify the version supplying experiment details.
- Narrow numerical and complexity claims to the operation, dataset and experiment actually reported.
- Separate research findings from our own implementation choices and performance targets.
- Replace obsolete mobile-only/backend-undecided wording with the confirmed mobile/web and Supabase design scope.
- Preserve three scientific sources plus two technical sources; add no duplicate publication count.

## Reading Notes to Complete

For each scientific paper, write your own short answers:

1. What problem and research question does it address?
2. What are the inputs, objective and main constraints?
3. How does the method work, and what was the comparison or evaluation?
4. Which result can you point to in a specific section/table?
5. What limits transfer to our project, and which design choice does it inform?

For the technical sources, explain persistence, notifications, authorization and recovery in your own words. Keep source verification separate from proof that our backend works.

Personal reading status: **Pending contributor confirmation**. After reading, record the actual date and any corrections; do not backdate completion. Send unresolved technical questions for review. DIP-10 can be closed when the specified review, analysis table, personal reading and required integration/review are complete. It does not wait for the application to be built.
