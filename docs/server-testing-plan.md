# Server Verification and Evaluation Plan

Prepared contribution: Aman Yerassyl. Status: proposed server plan integrated by reference in the [team evaluation plan](verification-and-evaluation-plan.md). No cases below have been executed; the backend is not yet implemented. Case IDs are stable verification labels; the traceability table below maps them to requirement IDs.

## Purpose and scope

Verify that the shared backend preserves private trip access, voting consistency, durable chat, balanced expenses and validated itinerary changes across web and mobile clients. The expected behavior follows the proposed [database design](database-design.md) and [backend component design](backend-component-design.md). Review role rules, voting semantics and evaluation thresholds with the team before execution; review the requirement mappings below.

Usability (SUS) and comparison with manual planning belong to the team's broader evaluation. This contribution defines server checks and measurements and does not replace those studies.

## Environment and test data

Use an isolated test project with the same migrations, access policies and server-function versions as the release candidate. Record the Git commit, schema version, service configuration, client versions, test date, region, network conditions and workload. Use synthetic users and places; keep service credentials outside the repository. An administrative connection may inspect outcomes but must not be used to simulate an ordinary client.

Create users O (owner/Organizer), E and P (editors/Participants), X (outsider) and L (former member). Trip A includes O, E and P as active members; L has a historical membership with left_at set. Trip B belongs to X. Give both trips itinerary items, votes, comments, saved messages and expenses. Use a KZT budget of 30,000.00 for Trip A, known place IDs, known visit durations and opening hours, and a fixed trip time zone. AI tests use controlled provider responses by default; use a separate opt-in run for a real provider.

Proposed permission baseline: owners manage membership and ownership; owners and editors change itinerary and financial records; all active members may read private trip data. Chat, comments and votes are enabled for active owners/editors. The viewer role is deferred; attempts to create it must fail validation. The team must confirm or revise this baseline before tests can be judged. Platform-specific table privileges must match the approved policy.

Run unauthorized operations through every exposed path that can perform them: Data API, database RPC, server command and Realtime where applicable. Changing only the interface is not sufficient verification.

## Access and membership

| ID | Setup and action | Expected result |
|---|---|---|
| ACC-01 | O, E and P read Trip A; X, L and a signed-out client request the same records | Active members receive permitted data. Others receive no private rows or payloads; the API may return denial or an empty policy-filtered result according to the agreed contract |
| ACC-02 | X and L attempt itinerary, vote, comment, message and expense writes; E attempts ownership/member administration and attempts to issue a viewer invitation | All disallowed writes fail, with no database changes. O can perform approved administration; E can perform approved editing |
| ACC-03 | E submits X's author/sender identity or Trip B's item ID in a Trip A command | Impersonation and cross-trip references are rejected. Legitimate actions record the authorized actor |
| ACC-04 | E opens a subscription; O removes E, then E requests data, writes and receives a new test event | After the removal transaction completes, new requests and events reveal no private data. Server/subscription authorization must enforce revocation; client sign-out alone is insufficient |
| ACC-05 | O attempts to remove or demote the last owner; concurrently transfer ownership in two requests | No committed state has zero or multiple active owners. Valid transfer is atomic; conflicting requests fail safely |
| ACC-06 | Publish a post linked to a private trip, then read as X | Only explicitly published post fields are visible. Private itinerary, members, expenses and chat remain inaccessible |

## Voting and itinerary consistency

| ID | Setup and action | Expected result |
|---|---|---|
| VOT-01 | E upvotes an item, repeats the request, then changes to a downvote | At most one current vote exists for that user/item. Retrying has the documented idempotent or conflict behavior; tally matches stored votes |
| VOT-02 | Submit two conflicting votes concurrently for the same user/item | Uniqueness is preserved. Final value follows the documented concurrency contract; no double counting |
| VOT-03 | Submit a vote as X or L, reference Trip B, or send value 0 or 2 | Invalid actor, relationship or value is rejected; existing votes remain unchanged |
| ITN-01 | Two editors load version N and both update/reorder the itinerary | One valid update commits; a stale conflicting update is explicitly rejected or safely serialized under the agreed version contract. No changes are silently lost |
| ITN-02 | Reorder entries; insert a duplicate position, negative duration or date outside the trip; shorten trip dates | Valid reordering succeeds atomically. Invalid states are rejected or handled through an explicit validated adjustment, never left partially committed |

## Chat and recovery

| ID | Setup and action | Expected result |
|---|---|---|
| CHT-01 | E sends a message while O has an active web/mobile subscription | The authorized message is persisted once and becomes visible to O. Record the delivery timing separately from correctness |
| CHT-02 | Drop the send response, then retry with the same client_message_id | Exactly one message remains for (trip_id, sender_id, client_message_id); retry returns the prior result or a documented duplicate outcome |
| CHT-03 | Disconnect O, create several messages, reconnect and refresh history | All committed messages are recovered once after client deduplication, even if live events were missed. Order uses a documented stable tie-breaker such as (created_at, id) |
| CHT-04 | X or L guesses a room/trip ID or connects without a valid session; send malformed or empty content | No private payload reaches an unauthorized client. Invalid content is rejected without a stored message |

## Expenses and shares

| ID | Setup and action | Expected result |
|---|---|---|
| EXP-01 | E records a 9,000.00 KZT expense with three 3,000.00 shares for valid participants | One expense and its shares commit together. Sum of shares equals the expense exactly |
| EXP-02 | Submit shares totaling 8,999.99 or 9,000.01; use negative shares, a nonpositive expense or a foreign-trip participant | The operation fails and no partial expense/share records remain |
| EXP-03 | Split 10,000.00 three ways using 3,333.33, 3,333.33 and 3,333.34; attempt unsupported currency mixing | Exact KZT total is preserved. Unconverted catalog estimates or unsupported currencies cannot silently enter trip totals |
| EXP-04 | Force a failure after the expense row but before all share rows are saved | The transaction rolls back completely; no unbalanced expense becomes visible |
| EXP-05 | Two editors replace shares for the same expense concurrently | Updates serialize or one conflicts explicitly; the committed total always balances. Select the locking/version mechanism before implementing this case |

## AI proposal and confirmation

| ID | Setup and action | Expected result |
|---|---|---|
| AI-01 | Provider stub returns known places, a feasible schedule and total estimated cost 29,000.00 KZT | Server returns a valid draft for preview. Saved itinerary is unchanged until confirmation; authorized confirmation saves atomically |
| AI-02 | Return nonexistent place IDs, malformed fields, overlapping visits, a closed attraction or total estimated cost 30,000.01 KZT | The server rejects or explicitly repairs and revalidates the proposal before presenting it as valid. It never silently saves invalid content |
| AI-03 | E receives a draft, O edits the itinerary, then E confirms the old draft; repeat after E is removed | Stale version or inactive membership prevents saving. The current itinerary remains intact |
| AI-04 | Simulate provider timeout, service error and invalid output | The command reports a controlled failure, preserves existing data and does not expose credentials or provider internals |
| AI-05 | Call AI commands as X or submit excessive/invalid request fields | Reject unauthorized/invalid requests before a provider call. Validate configured request limits and verify secrets do not appear in client responses |

A budget check must use a documented estimate model: included cost categories, currency, missing costs, transport assumptions and per-person versus whole-trip amounts. If required cost or scheduling data is missing, mark the draft incomplete and prevent a false “valid within budget” result. The 30,000.00 boundary tests use complete synthetic inputs. Weather and event provider integrations remain staged. The new catalog/event cases below use synthetic inputs and do not imply a live provider.

## Schema Revision Cases

All additional cases are **Not run**, like the original 25. The revised plan has **32 cases**.

| ID | Setup and action | Expected result | Requirements |
| --- | --- | --- | --- |
| INV-01 | Accept valid, expired and revoked invitations; race two different recipients for one token; retry the successful acceptance | Exactly one valid recipient obtains one active editor membership. Expired/revoked tokens and another recipient's replay fail; no raw token is stored/logged | FR-08, NFR-03/04/06 |
| INV-02 | Editor/outsider issues or revokes an invite; owner attempts an unsupported role; restore a former member through valid acceptance | Administration is owner-only; viewer is rejected; reactivation preserves required historical references without duplicate membership | FR-08, NFR-03/04 |
| CAT-01 | Enter zero traveler count, invalid language, unknown cost unit, missing source/price or insufficient accommodation capacity data | Invalid trip/profile data is rejected; incomplete catalog inputs cannot produce a valid-budget label; known fixture totals correctly reflect party size and nights | FR-02/04/06, NFR-08/09/11 |
| EVT-01 | Propose an overlapping valid event, canceled event, out-of-trip event and event linked to a different place | Only eligible dated events are accepted; discriminator/references and time-zone checks reject conflicts without changing the saved plan | FR-05/17, NFR-04/09 |
| AIP-01 | Retry a generation request key; confirm twice; cancel/expire a draft; force failure during itinerary/confirmation save | One proposal per request key; one atomic applied version; retry returns the prior outcome. Rejected/expired/failed drafts never alter the itinerary; rollback includes proposal status | FR-03/05/12, NFR-04/10 |
| FED-01 | Publish place-linked content, submit arbitrary private trip fields and publish unapproved/private media URLs | Published payload follows the public allowlist; private trip data and unapproved media are not exposed; invalid place/reference is rejected | FR-14, NFR-03/06 |
| MOD-01 | Report one post twice, impersonate another reporter and attempt moderation as an ordinary user; resolve using a provisioned reviewer | One report per reporter/post; identity is server-derived; ordinary users cannot set reviewer/disposition or inspect others' private reports; authorized resolution records actor/time | FR-15, NFR-03/04 |

## Requirement Traceability

| Cases | Requirements |
| --- | --- |
| ACC-01–05 | FR-01/02/08, NFR-03/04/06 |
| ACC-06 | FR-14, NFR-03/06 |
| VOT-01–03 | FR-09, NFR-03/04 |
| ITN-01–02 | FR-05/06, NFR-04/10 |
| CHT-01–04 | FR-11, NFR-02/03/04/10 |
| EXP-01–05 | FR-13, NFR-03/04/11 |
| AI-01–05 | FR-03/04/05/06/12, NFR-01/03/04/06/09/10/11 |
| INV/CAT/EVT/AIP/FED/MOD | Per-case references in the revision table above |

FR-10 comment integrity is exercised by ACC-02/03; add client comment-flow evidence under UAT-04. FR-07/16/18/19, SUS, layout, multilingual UI and cross-platform acceptance require the overall UAT/platform protocols. This server plan alone does not claim complete product acceptance coverage.

## Measurement protocol

| Measure | Definition and collection | Acceptance |
|---|---|---|
| Authorization correctness | Count denied unauthorized attempts and successful permitted controls; inspect actual rows and received event payloads | Every defined unauthorized case denies access; every permitted control works |
| Integrity correctness | Count duplicate votes/messages, cross-trip links, unbalanced expenses and partially saved commands after completed tests | Zero invalid committed states in the executed test set |
| Collaborative update delay | Start timer before the sender's write and stop when the receiver observes the matching saved record; use one coordinated test clock or instrumented harness | Record p50/p95 and failures; proposed NFR-02 target is p95 ≤3 seconds over 30 updates (at least 29/30 within target), subject to team review |
| Plan generation time | Server elapsed time from accepted request to validated draft or terminal failure; include provider call and server validation | Report server median/p95 and timeout/error rate separately. NFR-01 measures client submit to usable rendered draft: under 30 seconds in at least 9/10 live-provider runs; server timing alone does not satisfy it |
| Budget-compliant draft rate | Valid drafts with complete estimates at or below budget / all drafts returned as valid; report missing-cost, rejected and failed requests separately | Every draft labeled valid must pass the server's budget check; this does not establish real-world price accuracy |
| Generation success rate | Requests producing a validated draft / all authorized, well-formed generation requests | Report separately so a system that rejects every request cannot appear effective; target to be agreed |
| Reconnect recovery | Compare the complete committed message-ID set with the recovered set after reconnect | No missing or duplicate rendered messages after refresh/deduplication |

For an initial benchmark, propose five warm-up runs and 30 measured runs per scenario at one and five concurrent simulated users. Label these small-sample results as exploratory. Use the same dataset and configuration across comparable runs; separate deterministic stub runs from live AI-provider runs. Record failures instead of excluding them. For latency percentiles, specify the calculation method and include the sample count.

Zukhra's overall plan should separately compare the same trip tasks against manual planning with Google Maps and a group chat, measure planning completion time, and collect SUS after users complete defined tasks. Server timings alone cannot establish usability or total planning-time improvements.

## Evidence, ownership and execution status

Yerassyl prepares server fixtures and checks and records database/API evidence. Zukhra integrates requirement coverage and overall evaluation. Sayakhat supplies client and AI contracts and helps verify web/mobile scenarios. These are proposed responsibilities for team confirmation.

For each executed case record: case ID, final requirement ID, commit/schema version, actor, setup, request, actual result, expected result, verdict, redacted evidence and defect reference. Keep all cases Not run until executed. Use Pass, Fail or Blocked only with evidence; report how many were executed out of the total planned. Re-run affected cases after a fix and the relevant access/integrity regression group.

Exit criteria: all approved mandatory cases pass, no unresolved defect permits unauthorized access or corrupts stored data, benchmark results and unmet targets are disclosed, and the team reviews the report. This plan currently provides no evidence that those criteria have been met.
