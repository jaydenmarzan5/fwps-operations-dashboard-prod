# Contributing

## Before starting

1. Read `AGENTS.md` and the documentation relevant to the change.
2. Confirm the operational problem, affected roles, expected behavior, and evidence that the change is needed.
3. Check `git status` and preserve unrelated contributor work.
4. During an active pilot, avoid casual application changes. Coordinate scope, timing, test accounts/data, rollout, and rollback with the named pilot owner.

Do not describe a requested or planned feature as implemented until it exists in the repository. Do not report time savings, adoption, reliability, satisfaction, accessibility, or other impact without a reproducible measurement.

## Local setup

Install dependencies from the repository root:

```bash
npm install
```

Create `.env.local` with these names only; obtain values through the approved secret-sharing process:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never commit, print, screenshot, paste into issues, or log complete values. The service-role key must remain server-only.

Start the development server:

```bash
npm run dev
```

The repository does not include migrations or seed data. A local app still needs access to an appropriately configured Supabase project and approved test accounts. Do not point development experiments at production without explicit authorization and a recovery plan.

## Branches and commits

- Create a focused branch from the agreed base branch.
- Keep each commit cohesive and use an imperative summary that explains the outcome.
- Separate database migrations from unrelated UI refactors where practical, while preserving any required atomic rollout order.
- Do not commit generated `.next/` output, environment files, local artifacts, or secrets.
- Do not rewrite, reset, or discard another contributor's changes.
- Do not commit, push, merge, or deploy unless the task explicitly authorizes it.

## Code and TypeScript expectations

- Keep TypeScript strict and avoid broad `any` types; `components/AppShell.tsx` and role profile handling contain existing `any` usages that should not be copied without need.
- Reuse domain types in `types/database.ts`, but remember they are handwritten and incomplete rather than generated Supabase schema types.
- Use explicit Supabase column selections; do not replace them with `select("*")`.
- Handle and surface Supabase/API errors. Avoid success messages until all required operations have succeeded.
- Keep numerical and destructive workflows safe under retries, concurrency, and partial failure.
- Preserve accessible labels, focus behavior, keyboard operation, readable error states, and responsive layouts.
- Prefer focused components/utilities and established App Router patterns over new dependencies. Any dependency must have a concrete need, maintenance/security review, and explicit approval.

## Secure Supabase practices

- Treat the anon key as public and RLS as the authorization boundary for browser queries.
- Never import or reference `SUPABASE_SERVICE_ROLE_KEY` in client components or any module that can enter a browser bundle.
- Authenticate and authorize the caller before creating a service-role client.
- Treat UI role checks as presentation only; enforce permissions in RLS, RPCs, or server APIs.
- Validate role values, identifiers, input lengths, field allowlists, numeric bounds, and affected-row expectations at the trusted boundary.
- Prefer one transaction/RPC for operations that must update aggregates and history together.
- Minimize selected/returned columns and avoid exposing broad profile data when only a name is required.
- Do not store student records or student PII without explicit district approval and an approved data design.
- Test as signed-out, intern, supervisor, admin, and authenticated-but-unauthorized users.

## Database-change procedure

The current absence of migrations is a known gap, not a pattern to continue.

For a database change:

1. Inspect and export the current live schema/policies/functions through an approved administrative process.
2. Write a forward migration and, where feasible, a tested rollback or recovery procedure under a version-controlled migration directory (prefer the standard Supabase migration structure).
3. Include tables, constraints, indexes, triggers, RLS enablement/policies, grants, function bodies, ownership/security mode, fixed search paths, and execute permissions affected by the change.
4. Review least privilege for anon, authenticated, and service roles.
5. Test against a non-production project with representative data, role accounts, concurrency/boundary cases, and migration rollback/recovery.
6. Update `types/database.ts` or adopt generated database types as an explicit follow-up; update `docs/DATABASE.md`, `docs/SECURITY.md`, `docs/FEATURES.md`, and `docs/DECISIONS.md` as appropriate.
7. Back up/rehearse recovery and schedule the production migration with the authorized owner.
8. Record deployment verification and any irreversible consequence.

Never make an undocumented production-only policy or function edit. If an emergency change is unavoidable, capture the exact reviewed state in Git immediately afterward.

## Validation

Run the repository scripts:

```bash
npm run lint
npm run build
```

`npm run build` is mandatory before completion. The repository has no automated `test` script; do not imply that build/lint replace behavioral testing.

Document manual checks proportional to the change. For workflow/security changes, cover:

- login, session expiration, and sign-out;
- each affected role plus a signed-out/unauthorized request;
- school/area filtering and relevant realtime refresh;
- success, validation, permission-denied, network-error, and retry paths;
- numerical lower/upper boundaries and concurrent edits;
- activity attribution and aggregate/history consistency;
- confirmation, audit, backup, and recovery for destructive actions; and
- keyboard, zoom/mobile, contrast, and assistive-technology behavior where UI changes.

For documentation changes, also run:

```bash
git diff --check
```

Verify relative links, repository paths, evidence labels, and that no secrets or unsupported metrics appear.

## Production deployment precautions

Supplied history identifies Vercel, but no deployment configuration or runbook is checked in. Before a production deployment:

- confirm the authorized Vercel project, branch, domain, Supabase project, and environment separation;
- verify all environment-variable names are present and the service role is server-only;
- review the diff and migration order; take an approved backup before destructive/schema work;
- run the production build from the exact commit;
- identify rollback/recovery steps and the responsible person;
- deploy during an agreed window and avoid resetting live data without explicit confirmation;
- smoke-test all roles and privileged APIs against the intended environment; and
- record the deployed commit, migration versions, checks, issues, and decision-maker.

Do not use production user data in public demos, screenshots, DECA materials, or debugging artifacts without approval and appropriate minimization.

## Documentation responsibilities

- Product/scope change: update `docs/PRODUCT.md` and `docs/FEATURES.md`.
- Route/data-flow change: update `docs/ARCHITECTURE.md`.
- Schema, policy, trigger, or RPC change: update `docs/DATABASE.md` and `docs/SECURITY.md`.
- Significant rationale/tradeoff: add or revise an ADR in `docs/DECISIONS.md`.
- Pilot/measurement change: update `docs/PILOT.md` and `docs/ROADMAP.md`.
- Supported milestone: update `docs/CHANGELOG.md` without fabricating a release/date.
- Resolved uncertainty: close or revise it in `docs/OPEN_QUESTIONS.md` with evidence.
