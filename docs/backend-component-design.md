# Backend Component Design

## Implementation update — 24 October 2026

A reviewable local MVP implementation now exists: [migration/RLS/RPCs and deployment guide](../supabase/README.md), [HTTP/Edge adapter](../supabase/functions/planning-api/handler.mjs) and [execution evidence](server-implementation-evidence.md). Eight MVP tables are implemented; all 15 logical definitions remain retained. Local PostgreSQL/HTTP tests are separate from hosted acceptance. No Supabase project, real Auth/provider/Realtime deployment or complete Flutter application is claimed. Remaining text describes the earlier design baseline; earlier “not implemented” statements refer to that revision, not the new local code. Detailed interface/policy approval remains open.


## Five-function MVP boundary (23 October 2026)

This revision follows the supervisor scope recorded in [PR #10](https://github.com/yer455yl/collaborative-trip-planning/pull/10) and the [proposed responsibility split](mvp-scope-and-responsibilities.md). Android, iOS and web remain planned. Detailed ownership and interface acceptance are pending teammate replies; this document does not approve PR #10.

| Scope | Tables and responsibility |
| --- | --- |
| MVP support | `users`, `trips`, `participants`: authenticated trip creation and active owner/editor access |
| MVP planning | `places`, `plan_items`: catalog identifiers, route/map data and whole-party planned costs |
| MVP collaboration | `votes`, `invitations`: one current vote, owner-issued invitation and atomic acceptance |
| MVP generation | `ai_proposals`: initial route draft, validation and explicit versioned confirmation; no conversational editor |
| Deferred, retained | `events`, `comments`, `chat_messages`, `posts`, `post_reports`, `expenses`, `expense_splits` |

All **15** table definitions and results of PR #8/#9 are retained. `trips.expenses_enabled`, `places.booking_url`, `plan_items.event_id` and `item_type=event` are future fields; retaining them does not enable those capabilities. Actual expenses/debts differ from planned estimates. Weather, offline access and booking integrations are deferred. Future text below describes retained design only wherever it concerns these domains.

MVP invariants: owner = Organizer; editor = Participant; inactive members have no access. Both active roles edit/vote; only the owner administers invitations/membership. Initial generation uses the same trusted validation as manual editing. `plan_items.estimated_cost` is already normalized for the whole party. Never multiply it by traveler count again. Server-owned catalog prices, required categories and freshness policy must be checked independently of client totals. See the [proposed wire/transaction contract](mvp-server-contract.md) for errors, dates, units, confirmation and open questions.


This proposed design describes Yerassyl's backend and database contribution. It is intended for integration with Zukhra's overall architecture and Sayakhat's client and AI workflows. Supabase is the selected shared backend for Flutter mobile and web. Authorization, transactions and reconnect recovery still require the proof of concept described in the technology comparison. No services have been deployed.

## Diagram

![Backend components](../diagrams/backend-components.png)

[Editable draw.io source](../diagrams/backend-components.drawio). The source XML has been parsed and the PNG visually checked. The PNG was generated from the same definitions rather than exported through draw.io; the source was also opened and visually checked in draw.io on 20 October 2026. This is a component-oriented backend view, not a complete deployment diagram or the final whole-system Component Diagram.

## Responsibilities

| Component | Responsibility and boundary |
|---|---|
| Web and mobile clients | Present planning workflows and hold the user's session. They call the same backend. Client-side checks improve usability but do not establish permission |
| Authentication | Managed sign-in and token issuance. Application profile IDs correspond to identity records; authentication does not automatically grant trip membership |
| Data API | Policy-protected ordinary reads and writes through REST. Exposed tables require RLS and explicit grants. Complex operations must not be bypassed by direct table writes |
| Trusted operations | MVP server functions authorize membership changes, itinerary edits and initial AI requests; expense commands are deferred. They invoke transactional database functions where multiple records must change atomically |
| PostgreSQL | Stores the 15 application tables in the ER model and managed identity records separately. Enforces keys, constraints and policies; database functions implement atomic multi-record operations |
| Realtime delivery | Sends permitted change notifications to subscribed clients after persistence. The database remains authoritative; subscriptions are not durable message history |
| External AI provider | Receives a controlled planning request and returns untrusted draft content. Credentials stay in server configuration; the provider has no direct database access |

These are logical responsibilities. A single server-functions codebase may initially implement the trusted operations; the diagram does not require a separate microservice for each responsibility. Authentication, Data API and Realtime are managed platform services. PostgreSQL identity schemas are not additional application-domain tables in the ER count.

## Main workflows

### Reading and updating trip data

The client signs in and supplies its token on data requests. Policies check active membership and role for the requested trip. Ordinary permitted records may use the Data API directly. MVP operations affecting ownership or itinerary order must pass through a protected command and an atomic database transaction. Restrict direct writes to those records so clients cannot bypass invariant checks.

### Deferred: saving chat messages and notifying participants

An active member sends a message with a stable client_message_id. The authorized write persists it once, using the unique key described in the ER model. Realtime then delivers permitted change events. Clients deduplicate by record ID and reload stored history after reconnection. A missing WebSocket event must not lose a saved message.

### Generating and confirming an AI plan

The server checks the requester and trip, loads relevant places and constraints, and calls the AI provider. It validates the draft's place references, schedule and budget before returning it for preview. The existing saved itinerary remains unchanged. When the user confirms, the server rechecks permission and the current itinerary version and saves the valid changes atomically. Reject stale or invalid proposals. The revised ai_proposals table stores private structured drafts and confirmation outcomes. Confirmation and the itinerary version update occur in one trusted transaction; full conversation history remains outside this model.

### Membership (MVP) and expenses (deferred)

A protected operation handles accepted membership and ownership changes. Historical membership records remain available for linked messages and financial records; inactive users must lose access. Expense updates validate the payer, participating users, trip currency and exact sum of shares before committing. The role and invariants must be enforced within the trusted transaction, including when the server uses a privileged database connection.

## Consistency with other documents

The System Context Diagram includes clients and backend inside one logical system boundary. This view expands only the backend part. The ER model supplies the application tables used by PostgreSQL. The technology comparison supplies the rationale for REST, managed subscriptions and PostgreSQL.

The context diagram's maps/places provider is omitted here because this contribution does not finalize client map rendering or the provider integration. The [overall component view](architecture-and-use-cases.md) now includes the map integration; any private provider credentials and quotas require server-controlled access as appropriate. Wanderlog remains a product reference, not an integrated dependency.

## Review and verification still required

- Zukhra: confirm overall component boundaries and integration with requirements.
- Sayakhat: confirm web/mobile contracts, map integration and AI input/output structure.
- Yerassyl: implement and test RLS, command authorization, atomic invariants, duplicate handling and reconnect recovery.
- Check that inactive members cannot access reads or updates, privileged commands cannot bypass business rules, and invalid AI drafts cannot overwrite a saved plan.
- Confirm function execution limits and workload suitability before selecting the final server runtime. Add a dedicated service only if requirements or measurements justify it.

These are planned checks. No runtime, security or performance tests have been completed for this design.
