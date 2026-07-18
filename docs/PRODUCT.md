# Product and Operational Context

## Evidence labels

This knowledge base uses four evidence levels:

- **Repository-verified:** visible in the current source, package metadata, or Git history.
- **Supplied context:** historical or operational information provided by the project owner but not independently present in the repository.
- **Unverified inference:** a reasonable interpretation that still needs a developer or stakeholder to confirm it.
- **Proposal:** future work, not a current capability or outcome.

Technical conflicts are resolved in favor of the current repository and recorded in [Open Questions](OPEN_QUESTIONS.md).

## The operational problem

**Supplied context.** The project began during a Hardware & Technology internship after firsthand observation of the summer Chromebook Refresh workflow. Interns and supervisors worked across schools and operational sites. School progress, completed COWs (Classrooms on Wheels), damaged devices, room-specific issues, intern activity, and end-of-day status could be split among verbal check-ins, manual processes, spreadsheets, and separate communications.

The core bottlenecks were:

- limited shared visibility into progress across schools and areas;
- repeated or inconsistent status reporting;
- fragmented room/location and damaged-device context;
- difficulty connecting updates to the person who submitted them;
- limited supervisor oversight and correction tools; and
- an end-of-day process that had to consolidate information from multiple sources.

No baseline measurements for reporting time, check-in volume, errors, or user satisfaction are stored in the repository. These are observed problems and intended benefits, not quantified outcomes.

## Product response

**Repository-verified.** The application organizes work around areas, schools, progress counts, damaged-device counts, updates, and COW total change history. Authenticated users can view shared progress. Field users can submit numerical adjustments and notes. Supervisors/admins are shown school-total controls, while admins are shown account, reset, and update-deletion controls. See [Features](FEATURES.md) for the enforcement and verification status of each capability.

The product is more accurately described as an **operational workflow management application** than merely a dashboard. Reporting screens are one part of a workflow that also captures, attributes, corrects, and resets operational data.

## Users and stakeholders

| Group | Operational interest | Current repository representation |
| --- | --- | --- |
| Intern | Fast field updates with school, room/location, counts, and notes | `intern` role; all authenticated users can reach `/update`, subject to external RLS |
| Supervisor | Progress visibility, exception awareness, school completion, and total-COW corrections | `supervisor` role; school edit controls appear for supervisors and admins |
| Admin | User lifecycle, roles, cycle reset, and destructive corrections | `admin` role; admin UI and server-verified admin API routes |
| ITS Hardware & Operations leadership | Workflow reliability, oversight, security, and measurable value | Stakeholder group from supplied context; no separate role in code |
| John | Supervisor consulted about operational needs | Supplied historical context only; no personal or permission-specific record in code |
| District privacy/security/technology stakeholders | Platform approval, privacy, hosting, retention, recovery, and acceptable use | Required decision-makers; review status is not recorded |

Role names are repository-verified, but the complete database permission matrix is not because RLS policies are not version-controlled.

## Stakeholder-driven development history

**Supplied context.** The project followed this cycle:

1. Observe the existing workflow firsthand.
2. Identify visibility, communication, reporting, and oversight bottlenecks.
3. Discuss needs with supervisors, especially John.
4. Translate those needs into software requirements.
5. Build an initial prototype.
6. Rebuild with Next.js and Supabase.
7. Add authentication, roles, database protections, administrative tools, deployment, and production testing.
8. Conduct an informal intern pilot.
9. Fix issues found in use.
10. Prepare for a broader formal pilot.

Git history supports the Next.js/Supabase implementation and the July 2026 authentication, admin, consistency, attribution, and correction milestones. It does not independently verify the stakeholder conversations, pilot participants, production test results, or deployment environment.

## Current scope

The current repository supports or presents:

- school and area progress tracking;
- completed-COW and damaged-device counts;
- room/location notes and activity updates;
- end-of-day summaries and filters;
- submitter-name display through a restricted lookup call;
- school total changes and associated history;
- administrative account, role, reset, and correction workflows; and
- realtime refreshes when selected Supabase tables change.

Important limitations are documented in [Architecture](ARCHITECTURE.md), [Database](DATABASE.md), and [Security](SECURITY.md). In particular, database policies and function bodies are external to Git, some role restrictions are only visible in the UI, and general-note attribution is not confirmed by the insert code.

## Intended benefits

**Unverified expectations.** If the application fits the workflow and is governed appropriately, it may improve shared progress visibility, reporting consistency, supervisor awareness, correction of data-entry errors, and clarity around room-specific issues. Those benefits must be evaluated during a formal pilot; they must not be reported as achieved impact without evidence.

## Product philosophy

The project prioritizes:

1. reliability and data integrity;
2. fit with the actual field workflow;
3. user understanding and accessibility;
4. security, privacy, and maintainability;
5. stakeholder feedback; and
6. measurable organizational value.

Features should trace to an observed operational problem, stakeholder request, pilot finding, integrity or security requirement, usability need, or measurable value. Technical novelty is not a goal by itself.

## Possible expansion beyond Chromebook Refresh

**Proposal.** Stakeholders have discussed using the same operational model for damaged/broken-device location tracking and richer room-specific notes, and potentially for other hardware operations workflows. No long-term scope, owner, platform approval, retention policy, or expanded data model has been confirmed.

Analytics, export, notifications, broader audit logs, AI/RAG, and secure live-data assistants are also proposals unless the [feature inventory](FEATURES.md) says otherwise. Any AI capability should remain lower priority than reliable data, approved governance, and a measured pilot.

## DECA Business Solutions Project framing

The defensible project story is: workflow analysis and stakeholder collaboration were used to identify an ITS operations need, define and implement a focused solution, monitor pilot feedback, correct failures, and prepare to evaluate measurable impact. It should not be reduced to “I built a dashboard,” and it should not include unmeasured results.

The evidence and collection plan are in [Pilot](PILOT.md); implementation milestones are in [Changelog](CHANGELOG.md).
