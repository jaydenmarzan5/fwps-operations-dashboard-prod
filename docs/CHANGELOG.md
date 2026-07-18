# Changelog

This is a reconstruction of major milestones, not a complete release log. Dates and commit summaries in the first section are repository-verified from Git history. The repository has no release tags, version numbers, or checked-in deployment records. Database SQL may have been changed externally and is therefore absent from this history.

## Repository-verified milestones

### 2026-07-17 — Update consistency, attribution, and correction

- Replaced the numerical intern update path with the `submit_school_update` RPC call (`25e9e19`, “Fix intern progress updates”).
- Added submitter-name lookup/display to the end-of-day summary (`9122f7a`) and school update views (`60fbfb6`) through `get_update_submitters`.
- Added the admin-only summary UI and call to `delete_update_and_reverse` (`666f39a`).

These commits verify client integration only. The RPC definitions were not committed.

### 2026-07-08 — Admin API and reset hardening

- Added in-process rate limiting and additional input/security hardening to the admin users API (`af6b96f`).
- Moved dashboard reset behind a server route that validates the caller's token/profile role before using the service role (`32a01df`).
- Updated application icon assets (`78ce747`, `92f875e`).

### 2026-07-06 to 2026-07-07 — Administration and school controls

- Added admin dashboard, profile role management, reset confirmation, user creation, and user deletion workflows (`c984c96`, `5bf05e9`, `c4ed29a`, `f572613`).
- Added supervisor/admin total-COW editing, total-change history, and school completion override (`9be3f3e`, `c6cd4b0`, `859b864`, `5ca8674`).
- Hardened the admin user API and changed queries to explicit column selections (`e34752c`, `6677375`).

Role edits and school controls remain direct browser-to-Supabase writes and therefore depend on external RLS.

### 2026-07-02 to 2026-07-05 — Production-oriented Next.js application

- Added the initial repository and Next.js production application (`6890aec`, `e491f5a`).
- Connected Supabase packages/live data and update workflows (`f081b60`).
- Added Supabase email/password authentication, client route protection, and user role display (`c7e465f`, `56b85b2`).
- Added page transitions, navigation polish, school/detail layout improvements, and confirmation interactions through July 5 (`a740dc1` through `4d23b4b`).

“Production” in commit wording describes the implementation direction; Git alone does not verify the deployed environment or production approval.

## Supplied historical context — dates not independently verified

- The project began with an HTML prototype after firsthand Chromebook Refresh workflow observation and stakeholder conversations.
- It was rebuilt with Next.js and Supabase, reportedly deployed to Vercel, and tested locally and in production with multiple roles.
- An informal intern pilot identified the need for submitter attribution, selective correction, and a broader team walkthrough.
- Historical manual tests reportedly covered unauthorized APIs, cross-account attribution, and delete-and-reverse.
- A historical Lighthouse run reportedly returned Performance 100, Accessibility 94, Best Practices 100, and SEO 100.

No prototype source, Vercel configuration, test report, pilot record, or Lighthouse artifact is present in the current repository. These items must not be presented as current measurements or repository-verified outcomes.

## Documentation baseline

### 2026-07-17 — Context-based documentation entry

This knowledge base was created from the repository state at `666f39a` plus supplied product/pilot history. This entry records documentation work in the working tree; it is not a tagged release or committed milestone unless a future commit establishes it.
