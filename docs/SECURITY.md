# Security

## Scope and disclaimer

This is a source review and operational risk record, **not** a formal security certification, privacy determination, penetration test, or legal opinion. Supabase configuration, live secrets, platform settings, deployed headers, logs, RLS, grants, functions, backups, and network controls were not available in the repository and require district-authorized review.

No student records or student personally identifiable information should be stored without explicit district approval. The intended data scope is approved intern/employee account information, roles, school-level operational data, progress updates, damaged-device counts, and room/location notes.

## Authentication

- `app/login/page.tsx` uses Supabase email/password `signInWithPassword` and returns a generic invalid-credentials message.
- `components/AppShell.tsx` reads the browser session and redirects unauthenticated users to `/login`.
- `lib/auth.ts` calls `auth.getUser()` before reading the current user's profile.
- Sign-out requires a browser confirmation, calls `auth.signOut()`, and redirects to login.
- Admin APIs validate bearer tokens with `auth.getUser()` rather than trusting client-supplied identity or role values.

Unknown external settings include email-domain restrictions, invitation policy, password policy beyond admin-created passwords, MFA, session/token duration, breached-password protection, email-change behavior, login rate limits, account recovery, and offboarding.

## Roles and enforcement boundaries

The code recognizes `intern`, `supervisor`, and `admin`. The following table distinguishes interface behavior from verified backend authorization.

| Operation | UI/client restriction | Repository-verified backend restriction | External dependency |
| --- | --- | --- | --- |
| Open non-login pages | App shell requires a browser session | None at Next.js page layer | RLS must protect all data |
| Open `/admin` | Client profile check redirects non-admins | None for the page itself | RLS must protect profile reads/role writes |
| View Admin navigation | Admin only | None | Not a security boundary |
| Edit school total / mark complete | Supervisor or admin controls only | No Next.js server check | RLS policies on `schools` and `cow_total_changes` |
| Submit +/- update | Available to authenticated roles in navigation | RPC body external | RPC authentication/role logic and grants |
| Insert general note | Available to authenticated roles | Direct PostgREST write | RLS on `updates` |
| View submitter names | All authenticated workflow pages call RPC | RPC body external | RPC return filtering and execute grants |
| Delete and reverse an update | Admin control and client role guard | RPC body external | RPC must independently authorize admin |
| List profiles | Admin page only | Direct PostgREST read | RLS on `profiles` |
| Edit another user's role | Admin page; prevents self-demotion | Direct PostgREST write | RLS must independently authorize and validate roles |
| Create/delete users | Admin page | API verifies JWT and profile role | Service-role configuration and Auth behavior |
| Reset dashboard | Admin page plus `RESET` confirmation | API verifies JWT, profile role, and confirmation | Service-role configuration |

UI restrictions improve usability but are not true authorization. The live RLS policies and function definitions must be reviewed before the permission model can be considered verified.

## Route protection

General route protection is implemented in `components/AppShell.tsx` after client code loads. There is no `middleware.ts`, server layout guard, or server-rendered authorization layer. This is acceptable only if all sensitive data and writes are independently protected by Supabase RLS/RPC authorization and protected APIs.

`app/admin/page.tsx` performs a client-side admin redirect. Users could still request the route bundle and invoke browser Supabase calls manually; RLS is the necessary boundary.

The two admin API routes independently verify admin access and do not rely on the page check. That is the strongest repository-verified authorization path in the application.

## Supabase and RLS

The public URL and anon key are intentionally used in browser code. They are not database authorization by themselves. Supabase RLS, grants, and authenticated JWT claims must limit reads and writes.

No RLS SQL is in the repository, so the following remain assumptions requiring live verification:

- unauthenticated users cannot read operational tables;
- users can read only appropriate profile data;
- only admins can list profiles or update roles;
- only supervisors/admins can directly update school totals and insert total-change history;
- general notes are attributed and limited to authenticated users;
- `submit_school_update` permits intended callers and validates fields/bounds;
- `get_update_submitters` exposes only minimal names to appropriate callers;
- `delete_update_and_reverse` checks admin access inside the database; and
- Realtime delivers only changes the subscriber may read.

Function ownership, `SECURITY DEFINER`/`SECURITY INVOKER`, fixed `search_path`, execute grants, and SQL-injection resistance also require review.

## Server-side privileged operations

`app/api/admin/users/route.ts` and `app/api/admin/reset/route.ts`:

- require a bearer token;
- validate it using the anon client and `auth.getUser()`;
- query the requester's `profiles.role` as that user;
- require exactly `admin`; and
- only then use a server-created service-role client.

The users route validates role values and basic input length/format, prevents self-deletion, and prevents deletion of the last admin. Creation rolls back the Auth account if the profile upsert fails.

Security/integrity limitations:

- Role editing does not use the protected API; it is a direct client update and depends entirely on RLS and database constraints.
- User deletion removes the profile before the Auth user. Failure of the second call can leave an Auth account without a profile.
- Reset performs three sequential service-role mutations without a visible transaction or rollback.
- There is no repository-visible audit log for role changes, user lifecycle operations, update deletions, resets, mark-complete actions, or service-role use.

## Environment variables and service role

| Name | Exposure | Use |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Public/anon client; safety depends on RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin Auth and RLS-bypassing database work in API routes |

`.env` and `.env.local` are ignored by Git. Values must never appear in commits, tickets, screenshots, client bundles, logs, documentation, or chat transcripts. The service-role key must not use a `NEXT_PUBLIC_` prefix and should be rotated if exposure is suspected. Production and local projects/values should be separated and access limited to authorized maintainers.

All current table reads use explicit column lists rather than `select("*")`, reducing unnecessary data exposure. This is useful data minimization, not a substitute for RLS.

## Rate limiting

`app/api/admin/users/route.ts` implements ten requests per 60 seconds, keyed by HTTP method and a derived client IP. It reads `x-forwarded-for` first and `x-real-ip` second.

This control is **partial**:

- the map exists only in one Node.js process and resets on restart/cold start;
- serverless instances do not share counters;
- correctness depends on trusted proxy header handling;
- old entries are not proactively cleaned up;
- POST and DELETE have separate limits; and
- `/api/admin/reset` and the Supabase RPCs have no application-layer limit.

Use platform and/or shared-store controls if threat analysis requires durable limiting. Do not add complexity without an approved risk requirement.

## Destructive operations

### Delete and reverse update

The summary page requires a modal confirmation and warns that deletion reverses the numerical effect and cannot be undone. The client calls `delete_update_and_reverse`. The SQL is absent, so admin verification, locking, bounds, auditability, and atomicity remain unverified.

### Delete user

The UI requires typing `DELETE`. The API prevents self-deletion and deletion of the last admin. The action is not transactionally atomic across the public profile and Auth user.

### Dashboard reset

The UI and API both require the exact text `RESET`. The server verifies admin status, then permanently deletes update and COW total history rows and zeros completed/damaged totals, using a “not equal to the all-zero UUID” filter for each table. No backup, dry run, export, transaction, reset audit event, or recovery path is present.

These controls should be tested with least-privileged accounts and reviewed before each pilot/production cycle.

## Privacy and organizational review

Before formal or expanded use, FWPS stakeholders should confirm:

- approved user population and acceptable use;
- whether Vercel and Supabase are approved vendors/configurations;
- privacy classification of employee/intern names and operational notes;
- prohibition or approved handling of student data;
- data retention, deletion, records, and legal-hold expectations;
- backup, recovery, incident response, and breach notification;
- accessibility requirements and testing ownership;
- operational owner, administrator, and offboarding process; and
- approved metrics/analytics and whether consent or notice is needed.

See [Open Questions](OPEN_QUESTIONS.md).

## Priority gaps

1. Capture and review the live schema, RLS, grants, triggers, and RPC SQL as migrations.
2. Verify all direct browser mutations against a role-by-operation authorization matrix.
3. Make destructive/multi-write workflows atomic where required and record durable audit events.
4. Complete district vendor, privacy, security, retention, backup, and ownership review.
5. Add repeatable authorization/integrity tests and a recovery runbook before broader use.
