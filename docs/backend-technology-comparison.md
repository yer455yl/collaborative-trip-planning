# Backend and Communication Technology Comparison

Prepared by Aman Yerassyl. Documentation checked on 20 October 2026.

## Purpose and proposed decision

The project will provide web and mobile clients for collaborative trip planning. This document compares backend options and communication mechanisms. The proposed starting point is Supabase with PostgreSQL, Auth, REST data access and managed Realtime subscriptions. Protected server functions will handle AI requests and operations requiring trusted validation. This is a design recommendation pending team review and a small proof of concept; no backend has been deployed or benchmarked.

Wanderlog is a reference for user-facing planning workflows, not evidence of its internal technology. The original work plan specifies a mobile application; adding the web client must be reflected in the proposal and requirements.

## Requirements used for comparison

Both clients need a shared source of truth for trips, participants, ordered itinerary items, votes, comments, messages, posts, expenses and places. Private trip data must be available only to authorized members. Expense totals and membership changes require consistent validation. AI-generated plans must be checked against stored places and budget rules before the user confirms changes. Chat and collaborative updates need timely delivery; permanent data must survive a disconnected client.

The effort and suitability assessments below are engineering judgments for a three-person student team, not measured results. No assumptions are made about the team's existing framework expertise.

## Backend and database alternatives

Here, “Firebase” means Firebase Authentication plus Cloud Firestore. This comparison does not evaluate all other Firebase database products. Node.js is a runtime: the third alternative includes a custom API and a separately operated PostgreSQL database, rather than a complete managed backend product.

| Criterion | Firebase Authentication + Firestore | Supabase + PostgreSQL | Custom Node.js API + PostgreSQL |
|---|---|---|---|
| Data organization | Documents and collections [1]; relationships need deliberate document/query design | Relational database with SQL [5]; fits linked project entities | Relational database with SQL; API defines access patterns [9,10] |
| Integrity for linked entities | References and application validation need explicit design; SQL foreign keys are not part of the Firestore document model | PostgreSQL foreign keys, unique and check constraints [10] | Same PostgreSQL constraints, plus custom API validation [10] |
| Authentication | Managed authentication service and SDKs [4] | Auth integrated with the database platform [5] | Must integrate an identity provider or implement and maintain an authentication solution |
| Authorization | Firebase rules and server-side checks must be designed and tested | PostgreSQL Row Level Security policies can enforce row access [6] | API authorization must be implemented; database roles/RLS can add defense in depth |
| Web and mobile access | SDK-based access; exact platform support must match chosen clients [2,4] | REST data API and client libraries [7] | Shared HTTP API; client integration is the team's responsibility |
| Collaborative updates | Managed data listeners [2] | Managed Postgres Changes subscriptions [8] | A WebSocket service, polling or another event service must be integrated |
| Offline behavior | Firestore provides offline persistence on supported platforms with configuration differences [3] | No equivalent Firestore-style offline write synchronization is assumed; design caching and retry explicitly | Offline caching, queued writes and conflict handling must be designed |
| Trusted business logic | Add a trusted backend for AI credentials and complex operations | Use server functions; Edge Functions are an available option [11] | Implement in the API; CPU-heavy optimization should use suitable worker execution [9] |
| Initial implementation effort | Likely low for authentication and live data; linked-domain modeling needs care | Likely low to moderate: managed services plus relational schema and access policies | Likely higher: API, identity integration, event delivery, deployment and monitoring |
| Portability | Moving the document model and service-specific integrations requires migration work | PostgreSQL schema/data are portable; Auth, Realtime and functions still need migration work | More application control, with more operational responsibility |
| Cost drivers | Reads, writes, deletes, storage and transfer; listeners can generate billable reads [12] | Plan, compute and included/extra usage such as storage, transfer and Realtime [13] | Hosting, database, storage, transfer, identity service and operational effort; no provider selected |
| Main project tradeoff | Strong offline/client integration; model complexity for connected records | Relational integrity and managed collaboration; requires careful RLS and reconnect logic | Maximum custom control; more work before the first usable shared application |

No option is proven cheapest. A defensible estimate requires active users, concurrent connections, message volume, database operations, storage and transfer assumptions. Free-tier availability does not establish production cost or uninterrupted service. Check provider prices again before deployment; no paid resource is being created by this recommendation.

## Communication alternatives

These options operate at different levels and can be combined. A real-time listener is a subscription abstraction; Supabase Realtime uses WebSocket transport [14]. REST describes request/response interactions, while WebSocket enables a persistent two-way channel [15].

| Criterion | Managed real-time listeners | REST over HTTPS | Custom WebSocket service |
|---|---|---|---|
| Best fit here | Notify clients about saved messages, votes and itinerary changes | Fetch state, create/update records, submit protected commands | Custom bidirectional events if managed subscriptions become insufficient |
| Update model | Subscribe and receive matching changes [2,8] | A response follows a request; live refresh requires polling or another channel | Persistent bidirectional connection [15] |
| Development work | Subscription lifecycle, authorization, reconnection and state refresh | Endpoints/contracts, validation, retries and error responses | Connection auth, rooms, fan-out, persistence integration, reconnect and replay |
| Persistence | Database-backed events can reflect stored records; events alone are not the durable history | Writes must commit to the database before success is reported | Socket delivery alone does not store a message |
| Disconnection | Reload authoritative state after reconnect; do not assume every event was received | Retry safely; use idempotency for commands that must not duplicate | Design resynchronization, deduplication and delivery handling explicitly |
| Proposed role | Selected for MVP collaboration | Selected for state reads and writes | Deferred until there is a demonstrated requirement |

## Proposed architecture and decisions

1. **Database: PostgreSQL through Supabase.** The domain has many connected records. Foreign keys and constraints support explicit relations and prevent some invalid states. This is a project-fit judgment, not a claim that Firestore cannot support the application.
2. **Identity and access: Supabase Auth and trip-membership policies.** Web and mobile clients use the same identity system. Exposed tables require explicit access policies; privileged secrets stay on the server. RLS must be tested for owner, member, outsider and removed-member cases.
3. **Data access: HTTPS REST and transactional database operations.** Use the generated data API for policy-protected ordinary operations. Use database functions or trusted server functions for membership changes, expense operations and itinerary updates requiring multiple atomic changes. A client-provided trip ID is never sufficient authorization.
4. **Live collaboration: managed Realtime.** Persist chat messages before notifying other clients. Scope subscriptions to the relevant trip and enforce actual authorization. After reconnecting, fetch current records and deduplicate by record ID; refresh when access changes. Event filters are not a substitute for permissions.
5. **AI integration: trusted server execution.** The server checks membership, validates input and calls the external AI service. It validates proposed places, time and budget, then returns a draft. Saving requires user confirmation and validation against the latest itinerary version. The AI provider and execution limits remain undecided.
6. **Custom Node.js service: reserve option.** Introduce a dedicated service if measured processing needs, integration requirements or function execution limits require it. A separate Node.js layer is not necessary solely to claim that the project has a backend.

Expense values should use an exact monetary representation and a defined currency. Concurrent updates require version/conflict checks. These are proposed application requirements, not features automatically supplied by choosing a platform.

## Proof of concept before final approval

The following are planned checks, not completed test results:

- Connect one web client and one mobile client to the same test trip; create a saved message and confirm both see it. Record end-to-end delay; the team must agree on an acceptance threshold.
- Verify that an outsider cannot read, change or subscribe to private trip data; verify loss of access after membership removal.
- Disconnect a client, create updates on the other, reconnect and confirm the complete saved state is restored without duplicate messages.
- Submit a vote twice and verify the agreed uniqueness rule; attempt a conflicting itinerary edit and verify explicit conflict handling.
- Check monetary calculations and ensure an invalid or unconfirmed AI proposal cannot overwrite the saved itinerary.
- Estimate usage against current quotas and pricing; confirm selected SDKs and server-function limits suit the chosen frameworks and AI workload.

If the proof of concept fails because of a platform constraint, revisit the relevant decision. No performance or cost advantage is claimed until measured.

## Official sources

All sources below were accessed on 20 October 2026. Documentation describes capabilities; relative implementation effort and the recommendation are our analysis.

1. [Firestore data model](https://firebase.google.com/docs/firestore/data-model)
2. [Firestore real-time listeners](https://firebase.google.com/docs/firestore/query-data/listen)
3. [Firestore offline data access](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
4. [Firebase Authentication](https://firebase.google.com/docs/auth)
5. [Supabase database overview](https://supabase.com/docs/guides/database/overview)
6. [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
7. [Supabase REST API](https://supabase.com/docs/guides/api)
8. [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
9. [Introduction to Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
10. [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
11. [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
12. [Firestore billing](https://firebase.google.com/docs/firestore/pricing)
13. [Supabase pricing](https://supabase.com/pricing)
14. [Supabase Realtime architecture](https://supabase.com/docs/guides/realtime/architecture)
15. [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
