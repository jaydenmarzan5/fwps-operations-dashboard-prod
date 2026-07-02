# FWPS Operations Dashboard — Next.js Production Build

This is the Next.js + Supabase version of the FWPS Chromebook Refresh Operations Dashboard.

## What changed from the HTML prototype

Prototype-only instructional language has been removed. This version is structured as a real internal operations tool, not a demo.

## Current production features

- Dashboard with live school data from Supabase
- School and area filtering
- School code search
- Progress calculations
- Blue `Complete` status at 100%
- School detail view
- Intern update page
- Confirmation modal before count changes
- Room/location tracking
- General notes
- End-of-day summary
- Update filtering
- Realtime refresh using Supabase channels

## Required Supabase tables

This app expects these tables:

- `areas`
- `schools`
- `updates`
- `profiles`

The current code uses your existing columns:

### `schools`
- `id`
- `name`
- `code`
- `area_id`
- `total_cows`
- `completed_cows`
- `damaged_devices`
- `created_at`
- `updated_at`

### `updates`
- `id`
- `school_id`
- `user_id`
- `cows_completed`
- `damaged_devices`
- `room_number`
- `notes`
- `created_at`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Run locally:

```bash
npm run dev
```

4. Open:

```bash
http://localhost:3000
```

## Next recommended step

Add Supabase Auth and role-based permissions:

- Interns: view dashboard and submit updates
- Supervisors: edit school totals and manage area data
- Managers: manage all data
