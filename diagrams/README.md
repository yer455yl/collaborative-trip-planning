# Architecture Diagrams

## System Context

![System Context Diagram](system-context.png)

Open `system-context.drawio` in diagrams.net using **File → Open From → Device** to edit the diagram. `system-context.png` is the matching preview generated from the same node and relationship definitions. The source XML has been parsed successfully and the PNG visually inspected; rendering in the draw.io editor has not yet been verified.

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
