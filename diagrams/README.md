# Architecture Diagrams

## Integrated Views Added 22 October 2026

- [Use Case source — two editable pages](use-case.drawio): [core PNG](use-case-core.png), [collaboration/community PNG](use-case-collaboration.png), [combined PNG](use-case.png).
- [Overall Component source](overall-components.drawio) and [PNG](overall-components.png).
- [Overall architecture](../docs/architecture-and-use-cases.md), [requirements](../docs/requirements-specification.md) and [whole-team verification plan](../docs/verification-and-evaluation-plan.md).

The integrated views cover Android/iOS plus web from one Flutter codebase, selected Supabase and the existing backend/database contribution. Chat and the post feed are in scope; optional expenses/offline viewing and later weather/event integrations are labeled. PNGs are generated readable previews from the same definitions; editable sources are retained. No deployed services or executed test results are implied. The earlier backend contribution below retains its authorship and historical verification notes.


## System Context

![System Context Diagram](system-context.png)

Open `system-context.drawio` in diagrams.net using **File → Open From → Device** to edit the diagram. `system-context.png` is the matching preview generated from the same node and relationship definitions. The source XML has been parsed successfully and the PNG visually inspected; all five pages across the three source files were opened and visually checked in the draw.io editor on 20 October 2026.

The diagram describes the proposed system, not a deployed implementation. The organizer creates trips and manages members; participants contribute according to their assigned permissions. The web client, mobile client, shared backend, database and identity functions are inside one logical software-system boundary. Internal components will be detailed separately in the Component Diagram.

The external AI service returns draft plans or suggested changes. The application must validate proposals and obtain user confirmation before saving them. The external maps and places service supplies map, place and routing information; specific providers and API coverage remain to be selected and checked. Bidirectional arrows summarize requests and responses rather than individual endpoints.

Supabase is a proposed implementation platform within the system boundary, so it is not shown as a separate user-facing external system. Weather, events and other integrations will be added only when requirements and providers are confirmed. Wanderlog is a product reference, not an API dependency.

The diagram follows the supplied work plan and the team's confirmation that both web and mobile clients are in scope. Check it against the final requirements with Zukhra and Sayakhat before marking architecture review complete.

## Database ER Diagram

Open [database-er.drawio](database-er.drawio) for three editable domain pages. PNG previews:

- [Membership and expenses](er-membership-expenses.png)
- [Itinerary and voting](er-itinerary-voting.png)
- [Communication and community](er-communication-community.png)

See [database design](../docs/database-design.md) for keys, constraints, access rules and assumptions. This is a proposed schema; no database has been deployed. PNGs and editable pages share schema definitions but PNGs were generated separately, not exported through draw.io.

## Backend Component Diagram

- [PNG preview](backend-components.png)
- [Editable draw.io source](backend-components.drawio)
- [Responsibilities and workflows](../docs/backend-component-design.md)

This is the backend/database contribution for the team's combined Component Diagram. Client internals and the map integration still need team integration. No deployment or runtime validation is implied.
