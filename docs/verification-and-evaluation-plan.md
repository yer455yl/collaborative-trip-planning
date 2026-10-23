# MVP Verification and Evaluation Plan

Revision: 23 October 2026. Integration owner: Zukhra; backend tests: Yerassyl; AI/map tests: Sayakhat. Five-function scope: [MVP decision](mvp-scope-and-responsibilities.md). A plan is not an executed application study.

## Current execution evidence

The standalone Dart budget core has 34/34 deterministic checks passing and no analyzer issues on Dart 3.11.3 macOS arm64, 23 October 2026. Reproduce using [module instructions](planning-budget-module.md). These results cover exact arithmetic, unit normalization, completeness, invalid inputs, overflow and edit previews only. Flutter UI, database, authorization, generation/map providers, integration, load and SUS remain **Not run**.

## Ownership and verification layers

| Layer | Owner | Required evidence |
| --- | --- | --- |
| Trip/budget/editor units and client behavior | Zukhra | Code, synthetic fixtures, reproducible command/output; later form/editor and UI tests. |
| Identity, invitations, RLS, versioned persistence, votes and peer updates | Yerassyl | Migrations/functions/policies; authorized/unauthorized API/database tests; concurrency and reconnect records. |
| Generation, candidate IDs, map/list consistency and provider errors | Sayakhat | Typed adapter fixtures, malformed-output/timeouts, actual provider runs and map UI checks. |
| Whole MVP and user evaluation | All; Zukhra coordinates protocol | Recorded environment, task rubric, raw timings, redacted evidence and findings. |

The [server plan](server-testing-plan.md) is retained as Yerassyl's detailed contribution. Apply ACC/VOT/ITN and relevant generation/catalog/invitation/proposal cases to the MVP only after checking their actual descriptions. Exclude chat, expense, feed/moderation and event cases from the mandatory MVP denominator. Their earlier presence does not imply executed tests. Yerassyl must publish an explicit case-by-case MVP/deferred mapping; do not copy an obsolete total count.

## MVP acceptance cases

All application cases are **Not run**. Historical UAT-05–09 cover optional features and are deferred; their IDs are preserved. New UAT-11 isolates map behavior.

| ID | Action/fixture | Expected result | Coverage |
| --- | --- | --- | --- |
| UAT-01 | Sign in; create a trip; try reversed dates, invalid count and zero budget. | Valid inputs create trip+owner atomically; invalid values create no partial trip. | FR-01/02 |
| UAT-02 | Generate a known feasible draft; then unknown IDs, missing/unsupported prices and impossible budget; confirm/cancel. | Valid sourced estimate; no false valid label or unconfirmed save; server revalidation before commit. | FR-03/04/06, NFR-01/09/11 |
| UAT-03 | Add/remove/replace/reorder; compare daily/category totals; two editors confirm the same base version. | Exact recalculation; stale save rejected; cancel and failures preserve saved version. | FR-05/06, NFR-04/10 |
| UAT-04 | Issue/accept/replay/revoke invitation; vote/change/withdraw; disconnect/reconnect and remove membership. | No duplicate membership/vote; correct tallies; authoritative refresh; outsider/removed user denied. No chat/comment requirement. | FR-08/09, NFR-02/03/04 |
| UAT-10 | Run the agreed Android/iOS/web core build matrix and both peer-update directions; inspect form/editor/budget/map/vote layouts and keyboard navigation. | Same core permissions/data, usable controls and recorded platform defects. Build availability is not assumed. | NFR-07/12 |
| UAT-11 | Switch days and list/map; inspect order/coordinates/version; provider timeout or no route. | List and map agree; missing route is disclosed and saved itinerary remains readable. | FR-07, NFR-10 |

Use organizer/two editors/outsider/former-member synthetic accounts, two trips and exact boundary fixtures. Add unknown prices, missing required category/provenance, duplicate economic charges, out-of-range dates, provider errors, stale versions and rejected permissions. A known arithmetic fixture does not establish current Astana prices. Reset state between runs; record cache/warm-start conditions.

## Metrics and measurement conditions

| Measure | Procedure | Target/reporting rule |
| --- | --- | --- |
| Generation | Start client Submit; stop when usable validated draft renders; ten consecutive live-provider requests after declared warm-up. | At least 9/10 under 30 seconds; include failures/timeouts, all run times, median and separate server timing. Do not infer stable population p95 from ten runs. |
| Budget compliance | Complete code-checked estimates within budget / all drafts labeled valid. | 100% in executed set; disclose rejected/incomplete/unknown-data requests separately and report generation success as well. Not a real-world price guarantee. |
| Catalog validity | Eligible catalog IDs / all IDs in valid drafts. | 100% within executed fixtures; retain unknown/stale data negative cases. |
| Peer update | Sender Submit to peer render of same committed version; thirty coordinated-clock updates and declared concurrency/network. | Proposed p95 ≤3 seconds: nearest-rank observation 29/30. Failures/non-deliveries stay in results; confirm target with team. |
| SUS | Standard ten-item questionnaire after actual core tasks; at least ten consenting adult users. | Proposed mean ≥70/100, with n, individual pseudonymous scores, mean/median/spread and limitations; not a percentage success rate. |
| Planning time | Matched core planning briefs using app versus manual Google Maps + group chat. | Report comparable group-level time and quality outcomes, failed/assisted/incomplete tasks. No improvement claim before measurement. |

Record commit/build/schema, OS/device/browser/viewport, region, catalog/check dates, model/provider/prompt version, time zone, network, concurrency and test date. Separate deterministic tests/stubs from live-provider measurements. Never use a privileged session as an ordinary client.

## Manual baseline and study design

Propose ten adult participants in five pairs: five independent collaborative planning units, not ten independent group observations. Use matched Astana briefs A/B with equivalent duration, budget difficulty and identical information quality. Counterbalance app/manual order across pairs (3/2 split; disclose imbalance). Give neutral orientation and equal calculator access; manual planning uses Maps and group chat without an AI planner.

Start timing when the brief appears. Stop when both participants submit an acceptable plan: required days/categories present, resolvable places, complete estimated total within budget, opening/travel/visit times feasible and both members' constraints represented. Predeclare time limits; log invalid submissions, assistance and abandonment. Collect SUS individually before debriefing. Small-sample findings remain exploratory.

SUS scoring: odd item response minus 1; even item 5 minus response; sum and multiply by 2.5. Preserve standard wording/polarity and use a documented language version; do not invent missing answers. Method source: Brooke (1996), [publication record](https://verdi.cs.ucl.ac.uk/constructDB/publications/brooke-susa-1996.html).

## Evidence and exit conditions

Record case/requirement ID, exact version/environment, setup/action, expected/actual result, verdict, redacted evidence, defect and retest. Preserve raw timings and failed attempts. An MVP release requires approved Must cases and access/integrity checks to pass on the agreed build matrix; documentation acceptance does not imply release acceptance. The 15-response relevance survey is not a SUS/product-performance study. Initial budget tests do not validate the other four product outcomes.
