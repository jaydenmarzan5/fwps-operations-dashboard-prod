# Database

## Evidence boundary

This repository does not contain Supabase migrations, schema dumps, seed files, RLS policies, grants, triggers, or RPC SQL. The inventory below is reconstructed from:

- handwritten types in `types/database.ts`;
- explicit columns in `.select(...)`, `.insert(...)`, `.update(...)`, and `.upsert(...)` calls;
- nested PostgREST relationship selects; and
- API/RPC call arguments.

These sources verify what the application expects, not every database column, constraint, default, index, relationship, or policy. Supabase's Auth schema is managed externally. A database administrator must compare this document with the live project.

## Tables

### `areas`

Operational grouping for schools.

| Column | Expected TypeScript shape | Evidence | Notes |
| --- | --- | --- | --- |
| `id` | `string` | `types/database.ts`; reads in dashboard/schools/update/summary | Identifier; exact SQL type is not recorded |
| `name` | `string` | Type and all area reads | Used for filtering and labels |
| `created_at` | `string` | Type; dashboard and schools reads | Timestamp-like string; default/time zone unknown |

Consumers: `app/dashboard/page.tsx`, `app/schools/page.tsx`, `app/update/page.tsx`, and `app/summary/page.tsx`.

### `schools`

Current school-level operational state.

| Column | Expected TypeScript shape | Repository use |
| --- | --- | --- |
| `id` | `string` | Identifier and update target |
| `name` | `string` | Display and search |
| `code` | `string` | Display and search |
| `area_id` | `string \| null` | Relationship/filtering by area |
| `total_cows` | `number` | Denominator; directly edited by supervisor/admin UI |
| `completed_cows` | `number` | Progress; RPC-adjusted and directly set by “Mark Complete” |
| `damaged_devices` | `number` | Aggregate damaged-device count; RPC-adjusted |
| `created_at` | `string` | Read on dashboard/school detail |
| `updated_at` | `string` | Read by several pages; not displayed directly |

PostgREST nested reads such as `areas(id, name)` strongly indicate `schools.area_id` relates to `areas.id`. Foreign-key definition and null/delete behavior are not version-controlled.

Progress is calculated in `lib/utils.ts` as `completed_cows / total_cows`, rounded and capped at 100%. The UI prevents a new `total_cows` value below `completed_cows`; database constraints are unknown.

### `updates`

Activity records containing numerical effects and/or notes.

| Column | Expected TypeScript shape | Repository use |
| --- | --- | --- |
| `id` | `string` | Identifier and delete-and-reverse target |
| `school_id` | `string \| null` | Associates activity with a school |
| `user_id` | `string \| null` | Mapped to the restricted submitter lookup for display |
| `cows_completed` | `number` | Positive/negative COW effect; zero for general notes |
| `damaged_devices` | `number` | Positive/negative damaged-device effect; zero for general notes |
| `room_number` | `string \| null` | Room/location context |
| `notes` | `string \| null` | Human-entered operational note or generated action label |
| `created_at` | `string` | Ordering and display timestamp |

Nested reads of `schools(id, name, code, area_id)` strongly indicate `updates.school_id` relates to `schools.id`.

`app/update/page.tsx` directly inserts general notes without `id`, `user_id`, or `created_at`, implying external defaults or nullable columns for those omitted values. In particular, no repository code proves that general-note inserts receive the authenticated user's ID. A trigger/default may exist, but must be verified.

### `profiles`

Application identity and role record corresponding to a Supabase Auth user.

| Column | Expected TypeScript shape | Repository use |
| --- | --- | --- |
| `id` | `string` | Compared with `auth.getUser().id`; upserted from created Auth user ID |
| `full_name` | `string \| null` in page type; required by create-user API | User display and submitter lookup |
| `role` | `intern`, `supervisor`, or `admin` in validated paths | Navigation, UI permissions, and API authorization |
| `created_at` | `string` | Admin sorting/display and current-profile reads |

`app/api/admin/users/route.ts` creates an Auth user, then upserts a profile with the same ID. This verifies the application-level identity mapping; the exact foreign key to `auth.users`, cascade behavior, creation trigger, and uniqueness constraints are not in Git.

The admin page reads all profile IDs, names, roles, and creation timestamps directly from the browser. That query must be limited by RLS to appropriate callers. Other users read only their own row through `lib/auth.ts`, while submitter names are fetched through `get_update_submitters`.

### `cow_total_changes`

History for changes to a school's configured total number of COWs.

| Column | Expected TypeScript shape | Repository use |
| --- | --- | --- |
| `id` | `string` | List key |
| `school_id` | `string \| null` | Filters history to selected school |
| `changed_by` | `string \| null` | Current Auth user ID at insert time |
| `old_total` | `number` | Previous `schools.total_cows` |
| `new_total` | `number` | Replacement `schools.total_cows` |
| `reason` | `string \| null` | Optional explanation |
| `created_at` | `string` | Reverse-chronological display |

The nested select `profiles(full_name, role)` indicates a relationship from the history record to `profiles`, most plausibly `changed_by -> profiles.id`. `school_id -> schools.id` is inferred from use and naming. Exact keys are unverified.

The browser first updates `schools.total_cows` and then inserts the history row. This is explicitly non-atomic at the application layer; a failed history insert leaves the school update in place.

### Supabase Auth users

Supabase Auth users are external to the public application schema. Repository code uses email/password authentication and the Admin Auth API to create confirmed users and delete users. Auth-user columns, password storage, sessions, provider configuration, email policy, MFA, and token lifetimes are managed in Supabase and are not documented in Git.

## Relationship inventory

| From | To | Confidence | Evidence |
| --- | --- | --- | --- |
| `schools.area_id` | `areas.id` | Strong inference | Nested `areas(...)` selects and filtering |
| `updates.school_id` | `schools.id` | Strong inference | Nested `schools(...)` selects and per-school filtering |
| `updates.user_id` | `profiles.id` | Strong inference | Client maps `user_id` to RPC-returned profile `id` |
| `cow_total_changes.school_id` | `schools.id` | Reasonable inference | History is filtered by selected school |
| `cow_total_changes.changed_by` | `profiles.id` | Strong inference | Nested `profiles(...)` select; inserted Auth user ID |
| `profiles.id` | Supabase `auth.users.id` | Repository-verified application convention; SQL FK unverified | Create/delete API uses the same ID |

Cardinality, foreign-key actions, uniqueness, and nullability beyond the TypeScript shapes need live-schema verification.

## RPC inventory

### `submit_school_update`

Called by `app/update/page.tsx` with:

| Argument | Client value |
| --- | --- |
| `target_school_id` | Selected school ID |
| `update_field` | `completed_cows` or `damaged_devices` |
| `update_amount` | `-1` or `1` from the current UI |
| `update_room` | Trimmed room/location or `null` |
| `update_note` | Trimmed note or the action label |

**Repository-verified:** the client performs one RPC call and reloads school data after success.

**Supplied context, SQL unverified:** the function was introduced after RLS blocked interns from directly updating `schools`; it is intended to adjust the selected school and create the attributed update record together.

The SQL must be checked for authentication, allowed roles, field allowlisting, integer/bounds validation, row locking, nonnegative values, prevention of completion beyond the total, `user_id` assignment, transaction behavior, search path, function security mode, and execute grants.

### `get_update_submitters`

Called without arguments by `app/summary/page.tsx` and `app/schools/page.tsx`. Client code expects rows shaped as:

```text
id: string
full_name: string | null
```

**Repository-verified:** returned IDs/names are mapped to `updates.user_id`, and only the name is rendered.

**Supplied context, SQL unverified:** the function is intended to expose only the limited profile information required for attribution because broad cross-user profile reads are restricted. Its caller restrictions, returned row set, filtering, function security mode, and grants require verification.

### `delete_update_and_reverse`

Called by `app/summary/page.tsx` with `target_update_id`. The UI exposes the call only when the current profile query returns `admin`.

**Supplied context, SQL unverified:** the intended function behavior is to verify the caller is an admin, lock the update, reverse its completed-COW or damaged-device numerical effect while preserving nonnegative totals, delete the update, and do so atomically.

The repository proves none of those database internals. Verify handling of general notes, zero effects, updates containing both effect fields, missing schools/updates, completed values above `total_cows`, concurrent calls, auditability, and execute grants.

No additional RPC names were found in the current repository.

## Update attribution

Numerical updates go through `submit_school_update`; the supplied history says the RPC writes `auth.uid()` into `updates.user_id`. The display path then uses `get_update_submitters` to translate that ID to a name on `/summary` and `/schools`.

General notes use a direct insert that omits `user_id`. This conflicts with the broad supplied statement that new updates now store `user_id`. Until a live trigger/default is verified or the insert is changed, general-note attribution must be considered unverified. Older/null records intentionally render as `Unknown user`.

## Reversal and deletion

The current client does not calculate a reversal. It delegates the update ID to `delete_update_and_reverse`, which is the correct boundary for a race-safe transaction if implemented as supplied. Because the SQL is absent, numerical reversal, nonnegative enforcement, authorization, and atomicity are requirements rather than repository-verified facts.

The separate dashboard reset does **not** reverse updates individually. Through a service-role API route, it deletes update and total-change rows and then zeros two aggregate school fields wherever the row ID is not the all-zero UUID. That filter appears intended to cover all normal rows, but the exact exclusion should be documented and tested.

## Missing database artifacts

No `supabase/` directory or SQL file exists in the current tree or Git history. Missing version-controlled artifacts include:

- table and type definitions;
- keys, constraints, indexes, defaults, and triggers;
- RLS enablement and policies;
- grants and function execute permissions;
- definitions for all three RPCs;
- Realtime publication configuration;
- seed/reference data for areas and schools; and
- rollback and data-migration instructions.

Capturing a reviewed baseline and subsequent changes as migrations is the highest-priority engineering documentation task. See [Roadmap](ROADMAP.md).
