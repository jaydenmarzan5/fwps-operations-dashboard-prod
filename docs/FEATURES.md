# Verified Feature Inventory

## Status definitions

- **Implemented:** the end-to-end behavior needed for the stated feature is present in repository code, although normal external service configuration is still required.
- **Partially implemented:** a substantial UI or application path exists, but enforcement, integrity, coverage, or another essential part is absent or externally unverified.
- **Planned:** described as intended future work, with no current implementation.
- **Unverified:** claimed in supplied context but not established by repository evidence.

Because database SQL is not version-controlled, features whose core guarantee lives inside an RPC or RLS policy are generally marked partially implemented rather than fully verified.

## Current features

| Feature | Status | User role | Repository paths | Operational purpose / verification note |
| --- | --- | --- | --- | --- |
| Email/password sign-in and sign-out | Implemented | All users | `app/login/page.tsx`, `components/AppShell.tsx` | Uses Supabase Auth; external Auth settings remain unknown |
| Authenticated-route shell | Partially implemented | All users | `components/AppShell.tsx`, `app/layout.tsx` | Client redirects sessions without a user; no middleware/server page guard |
| Current user name/role display | Implemented | All users | `lib/auth.ts`, `components/AppShell.tsx` | Reads the current profile and displays it in the sidebar |
| School progress dashboard | Implemented | All authenticated users | `app/dashboard/page.tsx`, `lib/utils.ts`, progress components | Aggregates schools, completed COWs, damaged counts, average progress, status, and lowest progress |
| Area filter and school search | Implemented | All authenticated users | `app/dashboard/page.tsx`, `app/schools/page.tsx`, `app/summary/page.tsx` | Narrows operational views by area, school, code, and update content |
| School and area detail | Implemented | All authenticated users | `app/schools/page.tsx` | Shows area snapshot or selected-school progress, counts, updates, and total-change history |
| Realtime view refresh | Partially implemented | All authenticated users | `app/dashboard/page.tsx`, `app/schools/page.tsx`, `app/update/page.tsx`, `app/summary/page.tsx` | Supabase subscriptions exist; publication/RLS/configuration is external |
| +/- completed-COW and damaged-device update | Partially implemented | Field users; UI is not role-specific | `app/update/page.tsx` | Calls `submit_school_update`; SQL validation, authorization, attribution, and atomicity are unverified |
| Update confirmation modal | Implemented | Field users | `app/update/page.tsx` | Confirms target school and numerical effect before RPC call |
| General room/location note | Partially implemented | Field users | `app/update/page.tsx` | Directly inserts a zero-effect update; `user_id` is omitted, so attribution is unverified |
| End-of-day summary | Implemented | All authenticated users | `app/summary/page.tsx` | Shows filtered school aggregates and update activity; not an export or immutable report |
| Update type/content filters | Implemented | All authenticated users | `app/summary/page.tsx` | Filters by area, school, type, school/code, room, or note |
| Submitter names on end-of-day updates | Partially implemented | All authenticated users | `app/summary/page.tsx`, `components/UpdateCard.tsx` | Display mapping exists; RPC SQL and general-note attribution are unverified |
| Submitter names on school updates | Partially implemented | All authenticated users | `app/schools/page.tsx`, `components/UpdateCard.tsx` | Same restricted lookup and limitations as summary |
| Edit configured total COWs | Partially implemented | Supervisor/admin UI | `app/schools/page.tsx` | Direct school update followed by separate history insert; relies on RLS and is non-atomic |
| COW total change history | Partially implemented | All viewers; write shown to supervisor/admin | `app/schools/page.tsx`, `components/CowTotalHistory.tsx` | Displays old/new total, reason, actor, and time; logging can fail after the total changes |
| Mark school complete | Partially implemented | Supervisor/admin UI | `app/schools/page.tsx` | Directly sets `completed_cows = total_cows`; relies on RLS and creates no repository-visible audit event |
| Admin navigation/page gate | Partially implemented | Admin | `components/AppShell.tsx`, `app/admin/page.tsx` | UI/client redirect only; RLS is required for direct data operations |
| List users and roles | Partially implemented | Admin UI | `app/admin/page.tsx` | Direct profile read; authorization depends on external RLS |
| Create user | Implemented | Admin | `app/admin/page.tsx`, `app/api/admin/users/route.ts` | Server verifies admin, validates input, creates confirmed Auth user/profile, and rolls back Auth creation on profile failure |
| Delete user | Partially implemented | Admin | `app/admin/page.tsx`, `app/api/admin/users/route.ts` | Server verifies admin and protects self/last admin; profile/Auth deletion is not atomic |
| Edit user role | Partially implemented | Admin UI | `app/admin/page.tsx` | Prevents self-demotion in UI but writes directly to profiles; RLS/role constraint/audit are external |
| Dashboard reset | Partially implemented | Admin | `app/admin/page.tsx`, `app/api/admin/reset/route.ts` | Server verifies admin and confirmation; three destructive operations use a nonzero-ID filter and are sequential, unaudited, and without repository-visible recovery |
| Delete incorrect update and reverse totals | Partially implemented | Admin | `app/summary/page.tsx`, `components/UpdateCard.tsx` | Confirmation and RPC call exist; database authorization/reversal/atomicity SQL is external; control appears only on summary |
| Admin user endpoint rate limiting | Partially implemented | Admin API callers | `app/api/admin/users/route.ts` | Ten/minute per method/IP in one process; not distributed/durable; reset/RPC paths excluded |
| Explicit database column selection | Implemented | All data access | `app/**/*.tsx`, `app/api/admin/*/route.ts`, `lib/auth.ts` | No `select("*")` calls found; reduces overfetching |
| Responsive layout and transitions | Implemented | All users | `app/globals.css`, `components/PageTransition.tsx` | Responsive breakpoint and animated page/modals; current accessibility quality needs fresh testing |

## Context claims not fully verifiable from Git

| Claim | Status | Evidence/gap |
| --- | --- | --- |
| Supabase RLS protects the production schema | Unverified | No policies or schema dump in Git |
| Numerical update RPC changes the school and activity atomically | Unverified | Call site exists; SQL absent |
| Every new update stores `user_id` | Unverified / conflicting | General-note insert omits it; trigger/default unknown |
| Delete-and-reverse verifies admin, locks, bounds, reverses, and deletes atomically | Unverified | Call/UI exist; SQL absent |
| Production is deployed on Vercel with HTTPS | Unverified in repository | Supplied deployment history only; no platform config |
| Manual unauthorized API and role-based production tests passed | Unverified in repository | Supplied test history; no test artifacts/results |
| Historical Lighthouse scores were 100/94/100/100 | Unverified current quality | Supplied historical result; no report committed and not a current measurement |
| Formal team pilot has occurred | Unverified / pending | Supplied context says it is planned |

## Proposed features not found in code

The following are proposals, not current capabilities: structured pilot surveys, product usage analytics, CSV export, notifications, durable audit logs for destructive actions, broader device/location workflows, workflow expansion beyond Chromebook Refresh, an AI operations assistant, RAG over approved procedures, and secure tool calling for live questions.

See [Roadmap](ROADMAP.md) for prioritization rather than treating this list as a commitment.
