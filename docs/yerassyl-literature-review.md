# Yerassyl's Sources and Preliminary Literature Review

Sources checked on 20 October 2026. Focus: tourist itinerary optimization and backend support for collaborative web and mobile applications. The team confirmed both delivery platforms; the original work plan specifies a mobile application, so the proposal and requirements should be reconciled with this expanded scope.

## Relationship to Wanderlog and the project scope

The team identified Wanderlog as a product reference. Its [official website](https://wanderlog.com/) and [help center](https://help.wanderlog.com/hc/en-us), checked on 20 October 2026, describe itinerary and map views, collaboration, budgeting and expense splitting. These pages provide evidence for an existing-system comparison; they are not scientific publications and do not reveal Wanderlog's internal architecture or algorithms.

The selected literature does not need to mention Wanderlog. It should support the problems and methods addressed by our own system.

| Project concern | Relevant source | What the source supports |
|---|---|---|
| Selecting places and ordering visits within constraints | Ruiz-Meza and Montoya-Torres | Problem formulation and classification of optimization methods |
| Feasible schedules and travel between places | Adamo et al. | Travel times, visit durations and opening-hour constraints |
| Updating an existing itinerary | Hu et al. | A two-stage optimization concept; adaptation to user edits is our design interpretation |
| Sharing trip updates between web and mobile clients | Supabase and Firebase documentation | Candidate synchronization mechanisms, without a final technology choice |

The current sources do not establish usability benefits of a Wanderlog-like interface, the effectiveness of expense splitting, group consensus or AI assistance. Those topics need the team's other sources and user research. Crowd-aware optimization is optional research context unless suitable local data and a requirement are established. No claim is made that Wanderlog uses the cited methods, Supabase or Firebase.

Five sources have been selected: three scientific publications and two official technical guides. Technical documentation does not count as a scientific publication. To meet the team's requirement of at least eight scientific publications, combine this list with Zukhra's and Sayakhat's sources and remove duplicates. Client frameworks remain part of Sayakhat's separate technology comparison.

## Scientific publications

| Authors and year | Source | Approach | Findings from the available material | Limitations and relevance |
|---|---|---|---|---|
| José Ruiz-Meza and Jairo R. Montoya-Torres, 2022 | [A systematic literature review for the tourist trip design problem: Extensions, solution techniques and future research lines](https://doi.org/10.1016/j.orp.2022.100228). Operations Research Perspectives, 9, 100228 | Classification of TTDP models, objectives, constraints and solution methods | The review covers 102 studies; Orienteering Problem formulations and heuristic methods are widely used | The literature search ends in February 2021. Relevant to selecting and ordering visits under resource constraints. Indexed publisher excerpts, including methodology and conclusions, were checked; direct page access was blocked and full-text reading remains necessary |
| Tommaso Adamo, Lucio Colizzi, Giovanni Dimauro, Gianpaolo Ghiani and Emanuela Guerriero. Preprint 2022; journal publication 2024 | [A multimodal tourist trip planner integrating road and pedestrian networks](https://arxiv.org/abs/2207.00097). Expert Systems with Applications; [journal DOI](https://doi.org/10.1016/j.eswa.2023.121457) | Iterated local search for vehicle tours with pedestrian subtours and time windows | The authors report solving realistic instances with up to 3643 points of interest over seven days in a few seconds | Performance applies to the authors' experimental conditions; Astana requires its own data and measurements. Relevant to travel times, visit durations and opening hours. The abstract and full HTML preprint were opened; detailed evaluation of the experiments is still needed |
| Yue Hu, Zhixiang Fang, Xinyan Zou, Haoyu Zhong and Lubin Wang, 2023 | [Two-Stage Tour Route Recommendation Approach by Integrating Crowd Dynamics Derived from Mobile Tracking Data](https://doi.org/10.3390/app13010596). Applied Sciences, 13(1), 596 | Global multi-objective route optimization followed by local updates; improved NSGA-II | The abstract reports an average 7% reduction in crowding in a Dalian case study | This finding does not automatically transfer to Astana; visitor-flow data would be required. Local itinerary updates are relevant to our design. Indexed publisher abstract and introduction were checked; the full text has not yet been read |

## Technical sources

| Organization | Source | Documented mechanism | Limitations | Relevance |
|---|---|---|---|---|
| Supabase | [Realtime Architecture](https://supabase.com/docs/guides/realtime/architecture), accessed 20 October 2026 | WebSocket event delivery, PostgreSQL change subscriptions, Broadcast and Presence | Vendor documentation without an independent comparison. Pricing, quotas and application latency have not been evaluated here | Supports evaluation of vote, message and itinerary synchronization. The page was opened and read |
| Google Firebase | [Get realtime updates with Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/listen), accessed 20 October 2026 | Subscriptions to Firestore data updates | Vendor documentation rather than scientific evaluation. The data model, read costs and access rules require separate assessment | An alternative for delivering updates to mobile clients. The page was opened; platform-specific examples should be examined after the mobile stack is selected |

## Preliminary review for integration with the team's document

Tourist itinerary design involves selecting places and ordering visits under constraints. Ruiz-Meza and Montoya-Torres (2022) examine this as the Tourist Trip Design Problem and classify relevant models and methods. For our application, this supports explicitly defining time, budget and preference constraints and validating proposed plans against them.

Adamo and colleagues consider combined road and pedestrian networks. Their work supports considering travel times, visit durations and opening hours in our design. Performance on their datasets does not establish equivalent performance in Astana; this must be measured separately.

Hu and colleagues propose optimizing an initial route and updating it locally when conditions change. Our proposed application of this idea is to recalculate the affected part of an itinerary after a user modification. Crowd-aware planning requires reliable data and is not yet an established capability of our application.

Collaborative editing requires delivering updates to trip participants. Official Supabase and Firebase documentation describes mechanisms for this purpose. These sources establish implementation options rather than the superiority of either platform. The final choice should be justified separately against requirements, implementation effort and operational needs.

## Work remaining before submission

- Complete reading of the scientific papers, especially methodology and experiments; refine findings and limitations with section references.
- Check bibliography formatting against university requirements. Do not count Adamo's preprint and journal version as separate works.
- Combine sources with the team's list and verify the overall scientific-publication requirement.
- Agree on the final English wording with Zukhra before integrating the review.

This is a preliminary review and does not indicate that every publication has been fully read. Withdrawn paper arXiv:2304.08495 is excluded from the selected sources.
