# Yerassyl's Tasks by 20 October 2026

Based on the Work Plan until 20 October 2026. Dates below are the original deadlines, not claims that tasks were completed on time. Status reflects the artifacts currently available in the literature-review branch. Prepared designs still require team review; unchecked items remain incomplete or unverified.

## Repository — deadline 15 October

- [x] Prepare src, docs, diagrams, tests, config and .gitignore locally.
- [x] Create the GitHub repository and upload the initial structure.
- [x] Verify that the structure is present on GitHub.
- [ ] Grant access to all team members and the supervisor, then verify their access. Deferred at Yerassyl's request.

## Literature — deadlines 15 and 17 October

- [x] Select five initial sources: three scientific publications on itinerary optimization and two official backend technical guides. See yerassyl-literature-review.md.
- [ ] Confirm source coverage with the team, including any additional mobile-technology research. The combined list must contain at least 12 sources, including eight scientific publications.
- [x] Prepare a preliminary review and publication-analysis table with authors, year, approach, findings, limitations and project relevance.
- [ ] Complete full-text reading and verify findings and limitations. Some entries currently rely on abstracts or indexed excerpts.
- [x] Save the preliminary materials in docs/.
- [ ] Deliver the reviewed contribution to Zukhra for integration and remove duplicate references across the team.

## Technology and system context — deadline 17 October

- [x] Compare Firebase, Supabase and Node.js with PostgreSQL.
- [x] Compare managed real-time listeners, REST API and WebSocket.
- [x] Document the rationale for the proposed technology choices in backend-technology-comparison.md.
- [ ] Agree on the choices with the team and perform the proposed proof of concept.
- [x] Prepare the System Context Diagram as editable draw.io source and PNG in diagrams/.
- [ ] Open the source in draw.io to verify editor rendering and review the diagram against final requirements.

## Architecture and database — deadline 19 October

- [x] Prepare the backend/database component contribution as draw.io source, PNG and a workflow document (backend-component-design.md).
- [ ] Integrate the contribution with Zukhra's overall Component Diagram and confirm client/map/AI interfaces with Sayakhat.
- [ ] Check consistency between all diagrams and the final requirements.
- [x] Prepare the initial ER model: users, trips, participants, plan items, votes, comments, chat messages, posts, expenses and places; add expense_splits for individual shares.
- [x] Save editable ER source and three PNG domain views in diagrams/; document constraints and assumptions in database-design.md.
- [ ] Verify ER source rendering in draw.io and review the model with the team. No database has been deployed or tested.
- [ ] Help Zukhra integrate server checks into the verification and evaluation plan. Candidate checks exist in the backend and database documents but are not yet the team's final test plan.

## Shared responsibilities

- [ ] Help distribute the survey and conduct interviews.
- [ ] Review the complete README, documents, YouTrack link and contributions from every member.
- [ ] Create and close the relevant YouTrack tasks when the project is available.
- [ ] Complete Pull Request review before merging the working branch into main.
- [ ] Prepare the pre-defense-1 tag with the team after final review.

Each member commits from their own account. Include the real YouTrack task ID in future branch names and commit messages when available. Yerassyl authorized the initial work without IDs while YouTrack is unavailable. Submit changes through Pull Requests and obtain another member's review before merging. Do not commit secrets or respondents' personal data.
