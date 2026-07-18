# Product and Architecture Decisions

These records combine repository evidence with the supplied operational history. A decision can be accepted in product intent while its database implementation remains unverified because RPC/RLS SQL is missing.

## ADR-001: Use a controlled RPC for numerical school updates

- **Status:** Accepted; client integration verified, database implementation unverified
- **Context:** Supplied history says the original browser flow separately inserted an activity and updated a school. Intern RLS blocked direct `schools` updates, allowing an update record to appear without the corresponding count change.
- **Decision:** `app/update/page.tsx` sends numerical changes through `submit_school_update` with a school ID, allowlisted field name, amount, room, and note.
- **Rationale:** The database is the appropriate boundary for authorizing an update and coordinating the aggregate change with its activity record. One call also gives the UI one success/failure result.
- **Consequences:** Field, amount, bounds, caller role, attribution, concurrency, and transaction behavior must be enforced inside the function. The SQL definition and tests must be captured before atomicity can be claimed as repository-verified. General notes still use a separate direct-insert path.

## ADR-002: Resolve update submitter names through a restricted lookup

- **Status:** Accepted; call/display verified, function restrictions unverified
- **Context:** Supplied pilot feedback says anonymous timestamps were insufficient. Broad cross-user access to profiles would expose more account data than an activity view requires and was reportedly restricted by RLS.
- **Decision:** `/summary` and `/schools` call `get_update_submitters`, map returned profile IDs/names to `updates.user_id`, and pass only the display name to `UpdateCard`.
- **Rationale:** A purpose-specific interface can minimize exposed profile fields while supporting operational accountability.
- **Consequences:** The function must restrict callers and return only approved users/fields. Its SQL and grants are not in Git. General-note inserts omit `user_id`, so full attribution coverage is not yet established.

## ADR-003: Delete an incorrect update and reverse its effect in one database operation

- **Status:** Accepted product/integrity decision; client integration verified, atomic implementation unverified
- **Context:** Deleting only the activity would leave aggregate school values incorrect. Reversing in the browser would introduce race conditions and partial failure risk.
- **Decision:** Admin UI calls `delete_update_and_reverse` with the update ID after an irreversible-action confirmation.
- **Rationale:** Authorization, row locking, effect calculation, bounds enforcement, and deletion belong in one database transaction.
- **Consequences:** The operation is destructive and must be admin-only, auditable, concurrency-safe, and tested for every update type. The supplied context says it is atomic and prevents negative totals, but the missing SQL means those properties require human verification.

## ADR-004: Represent responsibilities with three application roles

- **Status:** Accepted; role names verified, full enforcement unverified
- **Context:** Interns submit field information, supervisors need operational correction controls, and admins perform account/system management.
- **Decision:** Profiles use `intern`, `supervisor`, or `admin`. The interface presents school-total controls to supervisors/admins and destructive/system controls to admins.
- **Rationale:** Least privilege and workflow clarity require separating routine field work, supervision, and system administration.
- **Consequences:** Every privileged operation needs backend enforcement, not only hidden controls. Admin API routes verify roles server-side, while direct profile/school writes and RPCs depend on external RLS/function code. Whether supervisors need additional permissions remains open.

## ADR-005: Reserve destructive actions for admins and require explicit confirmation

- **Status:** Accepted; UI and admin API checks partly verified
- **Context:** User deletion, operational-cycle reset, and update reversal can permanently remove data or change trusted aggregates.
- **Decision:** These actions are presented only to admins and use confirmation text or a confirmation modal. User and reset API routes independently validate the caller's JWT/profile role. Update reversal delegates authorization to an external RPC.
- **Rationale:** Restricting authority and adding deliberate confirmation reduce accidental and unauthorized destructive changes.
- **Consequences:** Confirmation does not provide recovery or auditability. Reset and user deletion have non-atomic steps, the reversal SQL is missing, and there is no durable destructive-action log.

## ADR-006: Organize the workflow around areas, schools, COWs, damaged devices, and updates

- **Status:** Accepted and repository-verified
- **Context:** Chromebook Refresh work occurs at schools within operational areas and requires both current totals and contextual field activity.
- **Decision:** `areas` group `schools`; schools hold current total/completed COWs and damaged-device counts; `updates` record effects and notes; `cow_total_changes` records changes to configured totals.
- **Rationale:** The model matches the operational questions: where work is occurring, how far it has progressed, what exceptions exist, who reported activity, and why a baseline total changed.
- **Consequences:** School aggregates and update history must remain consistent. The model should not be stretched to student/device-level records or unrelated workflows without approval and deliberate schema design.

## ADR-007: Keep the service-role credential behind server API routes

- **Status:** Accepted and repository-verified
- **Context:** Supabase Admin Auth and reset operations require privileges that must never be exposed to browser code.
- **Decision:** `SUPABASE_SERVICE_ROLE_KEY` is read only by Node.js route modules under `app/api/admin/`. The browser sends its access token; the server validates it and the profile role before creating the service client.
- **Rationale:** This prevents shipping the RLS-bypassing credential to users and establishes a trusted authorization boundary for the covered operations.
- **Consequences:** Every service-role route must repeat or centralize correct authentication/authorization and avoid logging secrets. Direct role editing is not yet routed through this boundary.

## ADR-008: Prefer pilot evidence and measurable value over feature quantity

- **Status:** Accepted product principle from supplied context
- **Context:** The application exists to improve a real workflow and support a DECA Business Solutions Project, not to maximize the number of frameworks or portfolio features.
- **Decision:** Prioritize reliability, workflow fit, security, usability, maintainability, stakeholder needs, and measurable outcomes. New work must trace to observed problems, feedback, integrity/security requirements, or approved value.
- **Rationale:** A focused tool with verified value is more defensible and useful than an overbuilt system with untested assumptions.
- **Consequences:** AI/RAG, analytics, integrations, notifications, and expanded workflows remain proposals until a validated need, approved data boundary, owner, and measurement plan exist.

## Superseded implementation approach

**Supplied history corroborated by commit `25e9e19`.** The numerical update workflow previously used separate client operations. It was superseded by the `submit_school_update` call because the split path could create inconsistent results under RLS. The old implementation is not current behavior and should not be reintroduced.
