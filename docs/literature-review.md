# Integrated Literature Review

**Project:** Development of a Mobile Application for Collaborative Trip Planning  
**Integration prepared for:** Kabysheva Zukhra · **Date:** 22 October 2026  
**Contributions:** Zukhra — group preferences/collaborative planning; Yerassyl — itinerary optimization/backend; Sayakhat — LLM planning/acceptance.  
**Status:** integrated draft for substantive team/supervisor review; remaining reading checks are explicit.

## 1. Purpose, Selection and Provenance

This review connects three questions: how to form a group-relevant itinerary, how to enforce travel constraints, and how to combine AI assistance with user control and shared state. It integrates [Zukhra's four-source contribution](literature/zukhra-literature-review.md), [Yerassyl's existing contribution](literature/yerassyl-literature-review.md) and [Sayakhat's existing contribution](literature-review-sayakhat.docx). The existing teammate files remain unchanged and retain their authorship; Zukhra's contribution is the group-planning analysis and the cross-topic integration. The former ZIP layout is not used for links.

The corpus comprises **13 distinct scientific publications (L-01–13) and two technical sources (T-01–02)**. Twelve scientific publications date from 2021–2025; the 2020 RAG paper is retained as a foundational work. Preprints and journal versions of the same work are counted once. Technical vendor documentation is not counted as a scientific publication. The withdrawn arXiv:2304.08495 is excluded, following the existing contribution's exclusion.

Selection was targeted and extended from the existing team bibliography using queries about group itinerary planning, preference aggregation, tourism fairness and AI travel planning. This is a structured narrative review, not an exhaustive systematic review. Access levels vary; abstract-level evidence is not presented as full-paper reading. The source register below records those limits. No contribution counts, survey findings or experimental outcomes for our app are inferred from this literature.

## 2. Critical Synthesis

### Group relevance and user control

Tourism recommendations can affect different stakeholders, and “fairness” requires a context-specific definition rather than a popularity score [L-01]. Preference aggregation and route construction are distinct activities [L-02/03]. More flexible approaches permit subgroups [L-04], but that would expand the current shared-plan scope. Our proposed design therefore begins with explicit interests, visible votes and reversible editing; it makes no fairness or subgroup-optimization guarantee.

### Feasibility and changes over time

The TTDP review organizes itinerary models around objectives and resource constraints [L-05]. Multimodal planning adds travel/visit times and opening windows [L-06]. A two-stage approach can revise an initial route as conditions change [L-07]. These support checking constraints and updating affected plan segments, but external datasets and algorithms do not establish Astana data quality or our response time. Crowd-aware optimization is not adopted without the required data.

### AI as one component of the planning system

TravelPlanner shows substantial failures under its benchmark's multiple constraints [L-08]. ItiNera combines natural-language interpretation with spatial optimization [L-09]. Hallucination research and retrieval augmentation motivate grounding generated content in checked information [L-10/11]. They do not establish that retrieval prevents every error, validates prices or solves group planning. Our interpretation is a structured candidate-ID draft, independent budget/schedule validation and explicit confirmation, with controlled failure when required information is unknown.

### Acceptance and collaborative persistence

Travelers' intentions are associated with usage experience and AI mistakes [L-12]; option reduction and who controls it matter in experimental settings [L-13]. These support evaluating understandable choices and user control, rather than assuming an AI chat improves usability. Separately, managed live-update mechanisms can support collaboration [T-01/02], but event delivery is not durable history or an application-level access guarantee. The proposed backend therefore persists changes, enforces membership and refreshes state after reconnect.

## 3. Publication Analysis Table

The linked references in Section 5 provide author/year/title/venue details. “Reported” below refers to the cited work, never our project.

| ID / author-year | Approach | Findings supported by inspected material | Limits | Consequence for this project |
| --- | --- | --- | --- | --- |
| L-01 Banerjee et al., 2023 | Tourism fairness review | Differentiates stakeholder perspectives and fairness concerns. | No universal metric or application proof. | Inspect individual preferences as well as final group output. |
| L-02 Rigakis et al., 2021 | Game-theoretic aggregation + firefly heuristic | Addresses heterogeneous group preferences before route construction. | Full experimental details unchecked. | Keep preferences separate from hard feasibility rules. |
| L-03 Sarkar & Majumder, 2022 | Multiple group itineraries | Considers interests, popularity, travel cost and missing history. | Publisher abstract/highlights only. | Allow explicit first-trip preferences; no historical-profile dependency. |
| L-04 Alatiyyah, 2025 | Ant colony optimization with subgroups | Handles conflict through dynamic subgroup formation. | Different scope; experiments not reproduced. | Explain why a single shared itinerary is the initial boundary. |
| L-05 Ruiz-Meza & Montoya-Torres, 2022 | Systematic TTDP review | Taxonomy of models/objectives/methods; examines 102 studies. | Search ends February 2021. | Define constraints before selecting an optimizer. |
| L-06 Adamo et al., 2024; preprint 2022 | Road/pedestrian route optimization | Integrates multimodal travel and time-window constraints. | External network/data and search settings. | Validate durations/hours locally; benchmark our own runtime. |
| L-07 Hu et al., 2023 | Global optimization then local crowd-aware update | Proposes a two-stage route adjustment method. | Dalian/mobile-tracking inputs are not Astana data. | Revalidate affected segments; no claimed crowd forecasting. |
| L-08 Xie et al., 2024 | TravelPlanner benchmark | GPT-4 achieves 0.6% success in the reported benchmark. | Model/configuration/dataset-specific 2024 result. | Test constraints directly; not a 2026 provider ranking. |
| L-09 Tang et al., 2024 | ItiNera: LLM + spatial optimization | Reports personalized, spatially coherent urban plans. | Not proof of group consensus, budget accuracy or Astana coverage. | Use specialized code around language interpretation. |
| L-10 Huang et al., 2025 | Hallucination survey | Reviews taxonomy, causes and mitigation. | General LLM evidence; no travel guarantee. | Reject unknown IDs and ungrounded cost facts. |
| L-11 Lewis et al., 2020 | Retrieval-augmented generation | Combines model generation and retrieved external memory. | Original tasks are not a travel optimizer. | Ground input; still validate every draft independently. |
| L-12 Kim et al., 2024 | Four studies of usage intentions | Publisher abstract reports experience/mistake effects. | Intentions are not long-term adoption or usability. | Evaluate trust/errors with real target users. |
| L-13 Shin et al., 2025 | Five option-reduction experiments | Examines negative option-reduction effects and human control. | Experimental choices differ from our collaborative app. | Preview alternatives and obtain confirmation; evaluate utility. |

The 0.6% figure in L-08 is an external benchmark result, not this project's performance. No reported improvement, satisfaction score or latency is transferred as an achieved result.

## 4. Engineering Implications and Evaluation

| Evidence theme | Proposed design decision | Requirement link | Planned verification |
| --- | --- | --- | --- |
| Preferences and conflict | Explicit interests/votes; keep conflicting feedback visible | FR-02/09/10/12 | Collaborative task; ask each member about missing preferences |
| Route feasibility | Code checks budget units, hours, visit/travel times | FR-03–07, NFR-09/11 | Feasible/infeasible fixtures and unknown-data rejection |
| AI reliability | Candidate IDs, validation, preview, confirm/cancel | FR-12, NFR-09/10 | AI-01–05 and UAT-02/05 |
| Shared state | Membership-scoped access, persistent messages, resync/version checks | FR-08–11, NFR-02–04 | ACC/VOT/ITN/CHT server cases and peer-update timing |
| Acceptance | Clear alternatives/cost effects; test rather than assume usefulness | NFR-05 | Task success, SUS and manual-planning comparison |

This mapping expresses our engineering interpretation, not the original authors' evaluation of our system. See [requirements](requirements-specification.md), [architecture](architecture-and-use-cases.md) and [evaluation plan](verification-and-evaluation-plan.md).

## 5. References

1. **L-01.** Banerjee, A., Banik, P., & Wörndl, W. (2023). A review on individual and multistakeholder fairness in tourism recommender systems. *Frontiers in Big Data, 6*, 1168692. [Article/DOI](https://doi.org/10.3389/fdata.2023.1168692).
2. **L-02.** Rigakis, M., Trachanatzi, D., Marinaki, M., & Marinakis, Y. (2021). Tourist group itinerary design: When the firefly algorithm meets the n-person Battle of Sexes. *Knowledge-Based Systems, 228*, 107257. [DOI](https://doi.org/10.1016/j.knosys.2021.107257).
3. **L-03.** Sarkar, J. L., & Majumder, A. (2022). gTour: Multiple itinerary recommendation engine for group of tourists. *Expert Systems with Applications, 191*, 116190. [DOI](https://doi.org/10.1016/j.eswa.2021.116190).
4. **L-04.** Alatiyyah, M. (2025). A novel group tour trip recommender model for personalized travel systems. *PeerJ Computer Science, 11*, e2589. [DOI](https://doi.org/10.7717/peerj-cs.2589).
5. **L-05.** Ruiz-Meza, J., & Montoya-Torres, J. R. (2022). A systematic literature review for the tourist trip design problem: Extensions, solution techniques and future research lines. *Operations Research Perspectives, 9*, 100228. [DOI](https://doi.org/10.1016/j.orp.2022.100228).
6. **L-06.** Adamo, T., Colizzi, L., Dimauro, G., Ghiani, G., & Guerriero, E. (2024). A multimodal tourist trip planner integrating road and pedestrian networks. *Expert Systems with Applications*, 121457. [Journal DOI](https://doi.org/10.1016/j.eswa.2023.121457); [author preprint, 2022](https://arxiv.org/abs/2207.00097). Counted once.
7. **L-07.** Hu, Y., Fang, Z., Zou, X., Zhong, H., & Wang, L. (2023). Two-Stage Tour Route Recommendation Approach by Integrating Crowd Dynamics Derived from Mobile Tracking Data. *Applied Sciences, 13*(1), 596. [DOI](https://doi.org/10.3390/app13010596).
8. **L-08.** Xie, J., Zhang, K., Chen, J., Zhu, T., Lou, R., Tian, Y., Xiao, Y., & Su, Y. (2024). TravelPlanner: A Benchmark for Real-World Planning with Language Agents. *Proceedings of ICML, PMLR 235*, 54590–54613. [Proceedings](https://proceedings.mlr.press/v235/xie24j.html).
9. **L-09.** Tang, Y., et al. (2024). ItiNera: Integrating Spatial Optimization with Large Language Models for Open-domain Urban Itinerary Planning. *EMNLP 2024: Industry Track*, 1413–1432. [Proceedings/DOI](https://aclanthology.org/2024.emnlp-industry.104/). Full author list is available in the proceedings record.
10. **L-10.** Huang, L., et al. (2025). A Survey on Hallucination in Large Language Models: Principles, Taxonomy, Challenges, and Open Questions. *ACM Transactions on Information Systems, 43*(2). [DOI](https://doi.org/10.1145/3703155); [author preprint](https://arxiv.org/abs/2311.05232). Counted once.
11. **L-11.** Lewis, P., et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. *Advances in Neural Information Processing Systems, 33*. [Proceedings](https://proceedings.neurips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html).
12. **L-12.** Kim, J. H., Kim, J., Kim, S., & Hailu, T. B. (2024). Effects of AI ChatGPT on travelers' travel decision-making. *Tourism Review, 79*(5), 1038–1057. [Publisher/DOI](https://doi.org/10.1108/TR-07-2023-0489). Online publication was 2023; the cited issue year is 2024.
13. **L-13.** Shin, S., Kim, J., Lee, E., Yhee, Y., & Koo, C. (2025). ChatGPT for Trip Planning: The Effect of Narrowing Down Options. *Journal of Travel Research, 64*(2), 247–266. [DOI](https://doi.org/10.1177/00472875231214196); [institutional record](https://ira.lib.polyu.edu.hk/handle/10397/113743). Issue year used rather than early online date.
14. **T-01.** Supabase. *Realtime Architecture*. Official technical documentation, accessed in the existing backend contribution on 20 October 2026. [Documentation](https://supabase.com/docs/guides/realtime/architecture).
15. **T-02.** Firebase. *Get realtime updates with Cloud Firestore*. Official technical documentation, accessed in the existing backend contribution on 20 October 2026. [Documentation](https://firebase.google.com/docs/firestore/query-data/listen).

## 6. Source Verification and Remaining Work

| Sources | Material inspected for this integration | Remaining check |
| --- | --- | --- |
| L-01 | Publisher metadata/abstract and selected methodology, consumer-fairness and conclusion text | Full cited-study audit not claimed |
| L-02/03 | Publisher-indexed abstract/highlights; publication metadata | Read full methods/experiments through legitimate access before detailed algorithm/performance claims |
| L-04 | Publisher-indexed PDF abstract and method/conclusion excerpts | Full algorithm/data/reproduction review not claimed |
| L-05 | Publisher/repository excerpts and Yerassyl's section-level reading notes | Verify remaining detailed model comparisons if used |
| L-06 | Author preprint landing record and existing contribution's section notes | Journal/preprint differences and experiment details need final author review |
| L-07 | Publisher-indexed abstract/method/conclusion text | No complete dataset/algorithm audit claimed |
| L-08/09 | Official proceedings metadata and abstracts | Review full benchmark configurations and algorithms before stronger claims |
| L-10/11 | Publisher/author abstract and source records; existing teammate contribution | Full taxonomy/methodology verification remains; avoid absolute reliability claims |
| L-12 | Publisher abstract and Crossref metadata | Full experimental designs/effects not independently checked |
| L-13 | Publisher/institutional abstract and indexed study excerpts | Full methods and effect interpretation need final team reading |
| T-01/02 | Existing backend contribution and cited official documentation | Recheck implementation details against selected SDKs/version |

The source-count requirement is covered by the proposed corpus, but this draft does not assert that all full papers have been read or that the review is supervisor-approved. Authors should review their contributions, resolve the listed limits, align bibliography style and record substantive feedback. Do not mark a reading/review task complete solely because this file exists.

## 7. Connection to the Current Project Baseline

The selected design now uses Flutter mobile plus web and shared Supabase. The architecture separates identity/membership enforcement, durable state and notifications, candidate retrieval, LLM interpretation and deterministic validation. These are design choices, not measured literature results.

The [resident survey](research/survey-results.md) adds local self-reported evidence: voting and day-plan generation were rated highly in this small sample, while responses to AI plan editing were more mixed. Those data inform priority and evaluation questions; they do not validate an algorithm or replace scientific publications. Chat/feed remain team-scoped features without a direct usefulness question in this questionnaire.
