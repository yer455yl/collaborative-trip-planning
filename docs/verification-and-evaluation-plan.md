# Verification and Evaluation Plan

**Version:** 0.2 — 22 October 2026, proposed for review.  
**Integration owner:** Zukhra; server verification contribution: Yerassyl; client/AI support: Sayakhat.  
**Execution status:** Not run. No usable application, backend or measured study results are asserted.

## 1. Evaluation Questions

1. Can users create and jointly revise an itinerary that meets the entered constraints?
2. Does the implementation enforce permissions, data integrity and explicit AI confirmation?
3. Are generation and shared updates timely under recorded conditions?
4. Can target users complete planning tasks, and how do they rate usability?
5. How does planning time compare with manual planning using Google Maps and a group chat?

The [requirements specification](requirements-specification.md) defines the proposed baseline. The existing [server plan](server-testing-plan.md) supplies 32 cases (ACC-01–06, VOT-01–03, ITN-01–02, CHT-01–04, EXP-01–05, AI-01–05). They are incorporated by reference without renumbering or claiming they passed. Confirm decisions D-01–08 before judging affected cases.

## 2. Test Layers and Ownership

| Layer | Focus | Responsible contribution | Evidence |
| --- | --- | --- | --- |
| Review | Requirement coverage, diagrams, contracts and data model | Zukhra with all members | Actual review comments, resolutions, linked revision |
| Unit | Budget units/rounding, date constraints, candidate validation, deduplication | Implementing member | Test code, fixture version, command, result |
| Database/API | Permissions, constraints, transactions, concurrency, recovery | Yerassyl | Server cases, requests/results and redacted database evidence |
| Client/integration | Complete mobile/web flows, map/list agreement, errors, AI preview | Zukhra and Sayakhat | Platform/build versions and case records |
| Performance | Generation and cross-device update measurements | All, coordinated by Zukhra | Raw timestamps, success/error counts, method and summary |
| User evaluation | Task completion, manual baseline, SUS, interviews | Zukhra | Consent procedure, pseudonymous study records, aggregated report |

No automated command is specified before the implementation and test runner exist. Add executable instructions when those artifacts are committed.

## 3. Environment and Fixtures

Record commit/build, schema/policy version, Android/iOS device and OS, desktop browser/version and viewport, backend region/configuration, model/provider/version, prompt version, catalog revision, dates/time zone, network/latency, concurrency and test date. Separate deterministic provider stubs from live-provider runs. Use an isolated project and synthetic accounts; never use a privileged database session as an ordinary client.

Reuse the server plan's users O/E/P/X/L (Organizer/two Participants/outsider/former member), Trips A/B and 30,000 KZT integrity fixture. That boundary fixture is synthetic and does not establish real Astana prices. Add a complete feasible itinerary fixture with declared per-person/group/night units, local transport, accommodation nights, opening hours, visit durations and travel times. Include an intentionally infeasible budget, unknown place, missing price, conflicting opening window, changed version, provider timeout and disconnected client.

For each case preserve its initial state. Reset or isolate test data so a prior vote, expense or cached response cannot influence the next measurement. Declare cache/warm-start state and keep all failed attempts in the log.

## 4. End-to-end Acceptance Cases

All cases below are **Not run**. Should features become release gates when scheduled for that release. Chat, the minimal community feed and reporting are already in the confirmed product scope and are covered by Must requirements.

| Case | Setup/action | Expected result | Requirement coverage |
| --- | --- | --- | --- |
| UAT-01 | Register/sign in; create a valid trip; try negative count, invalid date range and zero budget; sign out. | Valid trip has one owner; invalid inputs create no partial data; signed-out client loses protected access and cache. | FR-01/02, NFR-03/06 |
| UAT-02 | Generate from a complete feasible fixture, inspect accommodation/day totals and confirm. Repeat with impossible budget, missing price, closed place and unknown provider ID. | Valid draft resolves to catalog places and correct estimate units; only explicit confirmation saves. Invalid/incomplete output is rejected or clearly incomplete. | FR-03/04/06, NFR-01/09/11; AI-01/02 |
| UAT-03 | Add/remove/replace/reorder a place; change dates; have two editors confirm from the same base version. Switch between day list/map. | Totals/order stay consistent. Conflicting stale save is rejected; no silent lost update. Markers match the chosen day/place. | FR-05/06/07, NFR-04/10; ITN-01/02 |
| UAT-04 | Invite a second user, repeat acceptance, vote/change/withdraw, add a comment and send chat. Disconnect/reconnect. Remove the member and try all exposed access paths. | Membership/votes/messages do not duplicate; history recovers; removed user cannot receive new private data. | FR-08–11, NFR-02/03/04; ACC/VOT/CHT groups |
| UAT-05 | Ask “How much remains?”; request “Make Day 2 cheaper”; Cancel, then generate/Confirm; edit the trip or remove membership before confirming another draft. | Answers do not mutate state; preview shows cost impact; cancel preserves state; stale/unauthorized confirm fails; valid confirm commits once. | FR-12, NFR-09/10; AI-01–05 |
| UAT-06 | Enable expenses; enter a known amount and exact shares; retry with invalid totals/currency/member; interrupt the operation midway. | Valid balances match exact shares. Invalid/failed transactions leave no partial records. Disabling the UI does not erase history. | FR-13, NFR-04; EXP-01–05 |
| UAT-07 | Publish a place-related post; read it as an outsider to the associated trip; report it; attempt moderation as an ordinary user. | Only public fields are visible; report is stored under the approved workflow; only a designated reviewer can moderate. | FR-14/15, NFR-03; ACC-06, FED-01, MOD-01 |
| UAT-08 | Supply rain forecast and dated events; then remove/stale the data and fail maps/provider requests. Open available/missing external links. | Known context can propose eligible changes; no unconfirmed replacement, invented event or confirmed booking appears; missing services are disclosed. | FR-16/17/19, NFR-10/11 |
| UAT-09 | Load and cache a confirmed trip; disconnect; read the saved plan; attempt online actions; reconnect; sign out. | Read-only cache and last-sync state are visible; unavailable actions explain the need for connection; refresh is authoritative; sign-out clears private cache. | FR-18, NFR-03/10 |
| UAT-10 | Execute core flow on recorded Android/iOS and desktop Chrome/Safari targets; test web → mobile and mobile → web saved changes; check 390 × 844 and 1280 × 800 layouts and keyboard access; repeat navigation/validation in all three intended languages. | Core flow passes across the targets and both update directions; primary controls fit; keyboard focus/labels work on web; language switch preserves data; missing translations/platform defects are recorded. | NFR-07/08/12 |

Repeat affected acceptance and access/integrity regression cases after fixes. Evidence must distinguish a mock/stub pass from a live integration pass.

## 5. Metrics and Measurement Conditions

| Metric | Definition and procedure | Proposed acceptance/reporting |
| --- | --- | --- |
| Usable generation time | Start at client Submit; stop when a validated draft is rendered. Run 10 consecutive live-provider requests after a declared warm-up. Record backend request time separately. | NFR-01: at least 9/10 under 30 seconds. Timeouts/errors are not removed. Report each run, median and success/error counts; no stable population p95 claim from 10 trials. |
| Generation success | Valid usable drafts / all authorized, well-formed requests, including infeasible and provider-failure counts separately. | Report numerator/denominator per scenario. High rejection cannot be represented as good planning just because invalid plans were blocked. |
| Estimated-budget compliance | Drafts labeled valid that satisfy complete code-checked cost limits / all drafts labeled valid. | 100% within the executed set; report unknown-price, infeasible/rejected and failed requests separately. Does not measure actual merchant prices. |
| Grounding correctness | Eligible catalog place IDs / all place IDs returned in valid drafts. | 100% in the executed set; retain deliberate unknown-ID negative tests. |
| Update delay | Sender Submit to peer render of the matching committed record using a coordinated clock/harness; measure 30 updates, then repeat at the approved concurrency. | Proposed NFR-02: p95 ≤3 seconds. Nearest-rank p95 is sorted observation 29/30. Failures are recorded as non-delivery, never dropped. Agree threshold before execution. |
| Recovery/integrity | Compare committed IDs and recovered/rendered IDs; inspect post-transaction constraints. | No missing/duplicate recovered messages or invalid committed states in the approved executed cases. |
| Task completion | Participants/groups that meet a predefined task-quality rubric / all that start, plus errors, assists and abandonment. | Report full counts and completion time. Success is not “pressed Generate”; the plan must meet the rubric. |
| SUS | Standard 10-item questionnaire after using the app; calculate individual scores using the standard method. | At least 10 adult users; proposed mean ≥70/100. Report n, individual pseudonymous scores, mean, median, range/SD and limitations. This scale is not a percentage success rate. |
| Planning-time comparison | Time to an acceptable plan with the app versus manual Google Maps + group chat, using matched task briefs. | Report paired group-level times and quality outcomes. No improvement percentage is asserted before the study. |

For larger server benchmarks, preserve Yerassyl's proposed five warm-up and 30 measured runs at one/five concurrent simulated users. These server measurements complement the 10-run client acceptance check; they use different timer boundaries and must not be mixed in one distribution.

## 6. Manual-planning Baseline and User Study

Recruit at least 10 consenting adults from the intended users, aiming for five pairs for the collaborative task. Record recruitment method and relevant travel experience without publishing identifying data. Five pairs yield five independent collaborative planning units, not ten independent group observations. Collect SUS individually. If group composition or sample size changes, update the design before measurement.

Prepare two comparable Astana trip briefs A/B with the same duration, budget difficulty and catalog size but different candidate sets. Supply identical price/opening-hour/context information to both conditions, use the same devices/network where practical, and allow the same calculator access. The manual condition uses Google Maps and a group chat, with the final agreed itinerary posted in the chat. No AI planner is allowed in that baseline.

Counterbalance task/condition order across pairs and record the allocation; with five pairs the split will be 3/2, so disclose the imbalance. A short neutral orientation precedes both conditions. Avoid teaching participants the answer to either brief.

Start timing when the brief is revealed. Stop when the pair submits a plan meeting the predeclared rubric: all required days/categories covered, locations resolvable, dated opening windows feasible, travel time included, complete estimated total within budget, and both members' required constraints represented. Log invalid submissions, assists and abandonment. Set the time limit before recruitment and report censored/unfinished tasks separately rather than treating them as fast successes.

After app tasks, administer SUS before debriefing. Then ask what confused users, whether they trusted explanations/costs and whose preferences were missed. Compute paired differences only for comparable completed tasks and report incomplete pairs. With five groups, findings are exploratory; do not claim representative population effects or causality beyond this small study.

SUS method: for odd items subtract 1 from the 1–5 response; for even items subtract the response from 5; sum the ten contributions and multiply by 2.5. Keep the standard questionnaire wording and polarity; select a documented language version rather than improvising translations. Source: Brooke (1996), *SUS: A “quick and dirty” usability scale*, in *Usability Evaluation in Industry*, pp. 189–194 ([publication record](https://verdi.cs.ucl.ac.uk/constructDB/publications/brooke-susa-1996.html)). Missing items require follow-up or explicit exclusion, not invented answers.

## 7. Evidence Record and Exit Criteria

For each executed case record ID, requirement, date, commit/build/schema, device/environment, actor, fixture, actions, expected/actual outcome, verdict, redacted evidence, defect/task and retest. Use Not run, Pass, Fail or Blocked honestly. Preserve raw timing rows and count every attempt.

For the first pre-defense, demonstrate this plan, requirements, diagrams and unresolved decisions. Do not claim application acceptance or study completion. Later release acceptance requires approved Must cases to pass, no unresolved access/integrity defect, measured targets/limitations disclosed, reviewed Android/iOS/web core flow and an actual user-evaluation report. The `pre-defense-1` tag follows a whole-team artifact review; this plan alone is not a release approval.

## 8. Research Versus Product Evaluation

The [15-response resident survey](research/survey-results.md) is current relevance evidence. It is not a usability test of the unimplemented application and cannot establish SUS, latency, budget correctness or planning-time improvement. Interviews are not used as evidence in this submission. Future evaluation participants, runs, measured values and passes must be recorded only after they actually occur.
