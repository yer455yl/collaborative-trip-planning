# Literature Contribution: Group Preferences and Collaborative Planning

**Prepared for:** Kabysheva Zukhra's contribution · **Date:** 22 October 2026  
**Status:** critical synthesis for review, with source-access limits disclosed.

## Research Question

How can a trip planner account for different group members' preferences while retaining feasible schedules, budget control and understandable decisions?

The four scientific publications below complement Yerassyl's optimization/backend contribution and Sayakhat's LLM/acceptance contribution. They are used in the [integrated review](../literature-review.md) as L-01–04. Selection was targeted, using group itinerary, tourism recommendation and fairness queries; it was not an exhaustive systematic search. No database-search counts or screening statistics are claimed.

## Publication Analysis

| ID | Publication | Approach and available findings | Limitations and project relevance |
| --- | --- | --- | --- |
| L-01 | Banerjee, Banik & Wörndl (2023), *A review on individual and multistakeholder fairness in tourism recommender systems*. Frontiers in Big Data, 6, 1168692. [Article](https://www.frontiersin.org/journals/big-data/articles/10.3389/fdata.2023.1168692/full) | Review distinguishes consumer, provider, platform and societal concerns and discusses contextual definitions of fairness. | A taxonomy does not establish a validated fairness objective for our users. Ask whose preferences were omitted; do not claim vote totals prove fairness. |
| L-02 | Rigakis, Trachanatzi, Marinaki & Marinakis (2021), *Tourist group itinerary design: When the firefly algorithm meets the n-person Battle of Sexes*. Knowledge-Based Systems, 228, 107257. [DOI](https://doi.org/10.1016/j.knosys.2021.107257) | Publisher abstract/highlights describe game-theoretic preference aggregation followed by metaheuristic itinerary construction for heterogeneous groups. | Full experimental analysis remains unchecked. Separating group preference aggregation from feasible routing is relevant; we do not claim to implement this algorithm. |
| L-03 | Sarkar & Majumder (2022), *gTour: Multiple itinerary recommendation engine for group of tourists*. Expert Systems with Applications, 191, 116190. [DOI](https://doi.org/10.1016/j.eswa.2021.116190) | Publisher highlights address multiple itineraries, interests/popularity, travel cost and missing travel history. | Abstract-level access does not support an effect-size or deployment claim. Collect explicit interests for first-time users rather than requiring historical ratings. |
| L-04 | Alatiyyah (2025), *A novel group tour trip recommender model for personalized travel systems*. PeerJ Computer Science, 11, e2589. [Publisher PDF](https://peerj.com/articles/cs-2589.pdf) | The article proposes ant-colony-based group planning with dynamic subgroup formation to handle conflicting preferences. | Reported model results are not evidence about our app or Astana. Subgroup routing is a different scope choice and remains outside the proposed diploma baseline. |

## Synthesis and Design Consequences

Group planning has two distinct responsibilities: selecting activities acceptable to travelers and ordering them into a feasible itinerary. A highly rated option can still violate time or budget constraints. The reviewed approaches therefore motivate explicit preference handling alongside constraint checks; a chat or vote interface alone is not an optimization method.

For this project, the proposed first implementation collects stated interests/trip type, makes votes and disagreements visible, and uses transparent candidate filters. It validates opening windows, travel time and estimated costs in code before confirmation. This is our engineering interpretation of the literature, not a claim that any paper evaluated this exact workflow. See FR-03/05/06/09/12 and NFR-09/11 in the [requirements draft](../requirements-specification.md).

The review also distinguishes flexible subgroup routing from a single shared itinerary. The current application proposal assumes one shared plan; advanced splitting/rejoining algorithms would require additional membership, schedule and UX design. They are useful comparison material rather than an unannounced implementation commitment.

Evaluation should inspect both the group's final plan and individual feedback about omitted preferences. No claim of improved fairness, consensus or satisfaction can be made until the actual users complete the proposed tasks.

## Reading and Review Record

- L-01: publisher metadata, abstract, methodology description, consumer-fairness discussion and concluding limitations inspected. Full bibliography and every cited study have not been independently audited.
- L-02/03: publisher-indexed abstracts/highlights and publication metadata inspected. Full methods, datasets and numerical results remain to be read through legitimate access.
- L-04: publisher-indexed abstract/method/conclusion excerpts inspected. Full algorithm/experimental reproduction is not claimed.

Claims in this contribution are limited to the inspected material. The reading record distinguishes abstract/excerpt coverage from full-paper evaluation; no independent reproduction or unsupported effect size is claimed. Review the interpretation and bibliography with the team before approving the integrated document.
