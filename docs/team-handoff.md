# Backend Contribution Handoff

Prepared by Aman Yerassyl for Zukhra and Sayakhat. This package contains proposed designs and a test plan, not a deployed backend or executed test results.

## Materials to review and integrate

| Material | Location | Team action |
|---|---|---|
| Sources and literature contribution | [Literature review](yerassyl-literature-review.md) | Zukhra: integrate with the common review, check bibliography style and remove duplicate sources |
| Backend and communication comparison | [Technology comparison](backend-technology-comparison.md) | Confirm or revise the Supabase/PostgreSQL recommendation and REST/Realtime approach |
| System Context Diagram | [Diagram index](../diagrams/README.md) | Confirm users, system boundary and external services against final requirements |
| Database model | [Database design](database-design.md) and [editable ER source](../diagrams/database-er.drawio) | Check that the 11 tables support the agreed workflows and access rules |
| Backend component contribution | [Component design](backend-component-design.md) | Zukhra: integrate into the overall architecture. Sayakhat: confirm client, AI and maps interfaces |
| Server testing contribution | [Server testing plan](server-testing-plan.md) | Zukhra: integrate 25 proposed cases and measurement methods into the team evaluation plan |
| Remaining work | [Checklist](yerassyl-checklist.md) | Resolve review items with evidence rather than marking them complete by assumption |

## Decisions requested from the team

1. Confirm both web and mobile delivery in the proposal and requirements; the supplied work plan originally specified mobile.
2. Confirm the backend platform after a small proof of concept; no hosting or AI service has been provisioned.
3. Decide whether viewers are strictly read-only or may chat/vote. The current testing baseline treats viewers as read-only.
4. Confirm voting on itinerary items, one currency per trip, one payer per expense, and the handling of invitations and membership removal.
5. Select maps and AI providers and agree on request/response contracts and cost assumptions.
6. Agree on measurable latency and generation-time targets before running benchmarks.

## Review and release process

Review the literature-review branch through a Pull Request into main. Another team member must review before merging, as required by the work plan. Do not create the pre-defense-1 tag until the team's complete package is checked. Supervisor access and YouTrack task mapping remain separate team actions.

Both shauzatov and Zukhra2409 were observed as accepted Collaborators in GitHub access settings on 20 October 2026. Supervisor access has not been verified. A YouTrack board was visible during the session, but its tasks, IDs and ownership were not inspected; ask Sayakhat to provide the project link and map the work to real task IDs without rewriting history.

## Verification and limits

All contribution documents are in English. Editable XML files parse successfully, PNG previews have been visually inspected, and local Markdown links are checked before handoff. All five diagram pages were also opened and visually checked in draw.io on 20 October 2026. The literature file states which sections and sources were actually checked. Neither source review nor a prepared plan demonstrates that the application has been implemented or tested.
