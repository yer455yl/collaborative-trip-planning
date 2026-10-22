# Pre-defense Readiness Review

Repository inspection on 22 October 2026, based on main at `065647a` and the proposed DIP-19 schema-alignment revision. This review distinguishes existing deliverables from approval and runtime evidence. It does not certify completed research, personal reading or implemented functionality.

## Review Findings and Disposition

| Review request | Inspection result | Disposition |
| --- | --- | --- |
| Prioritized functional/non-functional requirements | Present: 19 FR and 12 NFR with acceptance criteria | Preserve IDs; align role/schema references in this revision |
| Use Case source and PNG | Present: editable two-page source and previews | Team review remains required |
| Overall Component diagram | Present alongside Yerassyl's backend view | Preserve integrated view; update backend table count and selected-platform wording |
| Evaluation metrics, conditions and manual baseline | Present, including generation time, budget, SUS and manual Google Maps/group-chat comparison | Extend server references to 32 cases; all tests remain Not run |
| Survey report and resident places | Present: aggregated 15-response snapshot and candidate list | Translate published labels to English without changing counts; snapshot does not prove survey closure or verified venue details |
| Combined literature | Present: all three contributions, 13 scientific publications and two technical sources | Full-text reading and substantive source checks remain explicit personal tasks |
| Trip/catalog/AI/feed fields in ER | Initial 11-table model omitted requested extensions | Add 15-table revised inventory, four-page editable ER and PNGs, lifecycle/validation rules |
| Role terminology | Backend viewer baseline conflicted with Organizer/Participant UI | owner = Organizer, editor = Participant; viewer deferred in design and verification |
| Obsolete handoff/checklist | Platform/backend choices and PR #1 status were outdated | Refresh against confirmed mobile/web/Supabase scope and merged PR #1 |
| Requirement-to-test links | Server cases lacked direct FR/NFR mapping | Add traceability and seven schema-revision cases |
| Initial AI save | AI source described immediate shared save; requirements required confirmation | Align AI and UX source descriptions to preview/confirm/cancel; static wireframes still need corresponding controls |
| English project files | Word body text was English; research JSON/quoted labels retained Russian/Kazakh | Publish translated labels and transliterated names; preserve numerical research results |

The current Git history contains substantial commits from all three members; the earlier “one commit” observation must not be reused as a current assessment. Commit count alone does not establish contribution quality or reading completion.

## Remaining Submission Evidence

| Item | What is still needed |
| --- | --- |
| Interviews | No interview notes are supplied; the current research report explicitly excludes interviews. Obtain genuine notes or supervisor acceptance of the changed research scope. Do not invent responses. |
| UX prototype | Static mobile/web wireframes exist, but a clickable Figma prototype/link is not supplied. Add the agreed click-through scenarios and align initial preview/confirmation and deferred social/settlement features. |
| Competitor comparison | Existing screenshots are not comparable generated three-day Astana outputs from Wanderlog, Trip Planner AI and Mindtrip. Collect the same dated input and actual outcome, recording login/paywall/provider limits. Do not infer lack of Astana support from an unavailable result. |
| Source understanding | Each member must personally read and explain their sources; a prepared review cannot establish that fact. |
| Supervision | Verify supervisor access, sent materials, actual feedback and a comment-to-action record. No invented approval. |
| Task acceptance | Add public commit/PR evidence to the appropriate YouTrack tasks; close only tasks whose acceptance criteria are met. Keep private tracker data outside the public repository. |
| Branch hygiene | At inspection, 14 remote task branches were ancestors of main. Remove only verified merged branches; preserve active/unmerged work. A branch deletion must not substitute for code review. |
| Release tag | `prob-period-1` exists. The original requested `pre-defense-1` name and final acceptance need team reconciliation; do not move an existing tag or imply a reviewed release. |

The backend is still a design package: no migrations, RLS, runnable clients or executed test evidence are provided. First pre-defense design readiness and later implementation readiness must be reported separately.

## Revision Validation

- Parse every draw.io XML source and the schema JSON; check repeated ER table definitions against the canonical inventory.
- Generate all four ER PNGs from the same field definitions and inspect readability; update backend source/PNG together.
- Render the two edited Word documents and inspect all resulting pages.
- Check local Markdown file links, requirement references, case counts and changed-file whitespace.
- Scan tracked text and Word XML text for Cyrillic; this language check does not perform OCR on historical screenshots or prove technical correctness.
- Confirm the survey aggregate count vectors are unchanged by label translation.

These are artifact checks. They do not constitute database, security, performance or usability test results.
