# Agent Instructions

The FWPS Operations Dashboard is an internal operational workflow management application for Federal Way Public Schools ITS Hardware & Operations. Its current repository-verified workflow centers on Chromebook Refresh: school progress, completed COWs (Classrooms on Wheels), damaged-device counts, room/location notes, end-of-day reporting, and controlled administration.

## Read before changing code

- Product scope and evidence rules: [`docs/PRODUCT.md`](docs/PRODUCT.md)
- System and data flows: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Tables, relationships, and RPC boundaries: [`docs/DATABASE.md`](docs/DATABASE.md)
- Authentication, authorization, RLS assumptions, and destructive operations: [`docs/SECURITY.md`](docs/SECURITY.md)
- Verified feature inventory: [`docs/FEATURES.md`](docs/FEATURES.md)
- Decisions and unresolved questions: [`docs/DECISIONS.md`](docs/DECISIONS.md), [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md)
- Pilot constraints and priorities: [`docs/PILOT.md`](docs/PILOT.md), [`docs/ROADMAP.md`](docs/ROADMAP.md)
- Contribution and deployment precautions: [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)

Read the relevant documents before changing related code. Application code should not be changed casually during an active pilot.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

`npm run build` is required before completing a change. The repository has no automated `test` script; report the role-based/manual checks performed. Do not invent a test command.

## Safety and evidence rules

- Treat the repository as the source of truth for implemented behavior. Never describe a feature as implemented unless the repository confirms it.
- Distinguish repository-verified facts, supplied historical context, unverified inference, and proposals.
- Never claim impact metrics unless they have been measured and verified.
- Never print, log, or commit secrets or complete environment-variable values. `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Assume UI visibility checks are not authorization. Verify server checks or RLS before relying on a role restriction.
- The SQL for RLS policies and RPCs is not currently version-controlled. Do not assert its exact behavior without checking Supabase.
- Document database changes and preferably store them as reviewed migrations. Keep application types and database documentation synchronized.
- Do not store student records or student personally identifiable information without explicit district approval.
- Do not commit or deploy unless the task explicitly authorizes it.
