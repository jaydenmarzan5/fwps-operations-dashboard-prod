# FWPS Operations Dashboard

The FWPS Operations Dashboard is an internal operational workflow management application developed for the Federal Way Public Schools (FWPS) ITS Hardware & Operations team. Its current focus is the Chromebook Refresh workflow: collecting field updates, maintaining school-level progress, tracking completed COWs (Classrooms on Wheels) and damaged-device counts, recording room/location context, and giving supervisors a shared end-of-day view.

The project addresses an operational problem in which progress and exceptions could be fragmented across verbal check-ins, manual processes, spreadsheets, and separate communications. It centralizes those signals in one authenticated workflow. This repository does not establish district-wide adoption or measured impact; a broader formal pilot and impact measurement remain pending.

## Primary users

- **Interns** record completed-COW and damaged-device adjustments and submit room/location notes.
- **Supervisors** review school and area progress and are presented with controls for school completion and total-COW changes.
- **Admins** manage accounts and roles, reset a refresh cycle, and remove incorrect updates through a delete-and-reverse workflow.

The effective permissions for direct Supabase operations depend on externally configured Row Level Security (RLS) policies. See [Security](docs/SECURITY.md) before treating a UI role check as enforcement.

## Core capabilities

- Authenticated school and area progress views
- Search, filtering, aggregate progress, and staffing-oriented status indicators
- Controlled numerical field updates through `submit_school_update`
- General room/location notes
- End-of-day update filtering and submitter display
- Supabase Realtime refreshes for relevant school, update, and audit-history changes
- Supervisor/admin school-total controls and COW total change history
- Admin account creation/deletion, role editing, cycle reset, and update delete-and-reverse controls

The RPC calls are verified in the application, but their SQL definitions and RLS policies are not stored in this repository. Exact database enforcement must be verified in Supabase. See [Database](docs/DATABASE.md) and the [verified feature inventory](docs/FEATURES.md).

## Technology

The application uses the Next.js App Router, React, TypeScript, Supabase PostgreSQL/Auth/Realtime/RPC, and a small set of UI libraries. Versions resolved by `package-lock.json` include:

| Dependency | Resolved version |
| --- | ---: |
| Next.js | 14.2.35 |
| React / React DOM | 18.3.1 |
| TypeScript | 5.9.3 |
| `@supabase/supabase-js` | 2.110.0 |
| Framer Motion | 12.42.2 |
| Lucide React | 0.468.0 |
| Sharp | 0.35.3 |

See `package.json` for declared version ranges and scripts; use the lockfile for reproducible dependency resolution.

## Local setup

Prerequisites are Node.js and npm versions compatible with the locked dependencies, plus access to an appropriately configured Supabase project.

1. Install the locked dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with these names. Never commit or share their values:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

   The two `NEXT_PUBLIC_` values are intentionally available to browser code and must be protected by database policies. `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must exist only in trusted server/deployment environments; it is required by the admin user and reset API routes.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`. The root route redirects to `/dashboard`; unauthenticated browser sessions are redirected to `/login` by the client application shell.

The Supabase schema, RLS policies, functions, and seed data are not included, so a fresh Supabase project cannot be reconstructed from this repository alone.

## Validation commands

```bash
npm run lint
npm run build
npm run start
```

There is no automated `npm test` script. `npm run build` is required before a change is considered complete, followed by manual testing appropriate to the affected roles and workflows.

## Deployment

Supplied project history identifies Vercel as the production host, with Supabase providing hosted authentication, database, RPC, and realtime services. The repository has no `vercel.json`, infrastructure-as-code, or deployment workflow, so the exact production project, domains, regions, environment configuration, approvals, and rollback procedure require human verification.

For a deployment, configure all three environment-variable names in the platform, keep the service-role value server-only, run a production build, verify the target Supabase project, and complete role-based smoke tests. Do not expose secrets in build logs or screenshots.

## Project knowledge base

- [Product and operational context](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [Security](docs/SECURITY.md)
- [Feature inventory](docs/FEATURES.md)
- [Architectural decisions](docs/DECISIONS.md)
- [Pilot and measurement plan](docs/PILOT.md)
- [Roadmap](docs/ROADMAP.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Changelog](docs/CHANGELOG.md)
- [Open questions](docs/OPEN_QUESTIONS.md)
