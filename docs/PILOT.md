# Pilot and Measurement Plan

## Evidence status

- **Supplied context:** an informal test with interns occurred and identified attribution, correction, and onboarding needs.
- **Repository-verified response:** submitter display and admin delete-and-reverse call sites were added on July 17, 2026; authentication, admin controls, and reset behavior exist in the current code.
- **Pending:** the broader formal team pilot's participants, dates, approvals, protocol, results, and measured outcomes.

This document is a plan, not evidence that the product is officially adopted or that it has improved performance.

## Informal pilot observations

### Observed problems — supplied context

1. Users needed to see who submitted each update, not only its timestamp.
2. Admins needed a way to remove a specific incorrect update without leaving school totals inconsistent.
3. Explaining the product only to interns was insufficient for establishing team-wide workflows and role expectations; a formal walkthrough appeared necessary.

### Implemented responses — repository-verified at the application layer

- `app/summary/page.tsx` and `app/schools/page.tsx` use `get_update_submitters` and render submitter names through `components/UpdateCard.tsx`.
- `app/summary/page.tsx` shows admins a deletion confirmation and calls `delete_update_and_reverse`.
- The admin page provides account, role, reset, and confirmation workflows that can support pilot setup.

Database implementation details for the RPCs remain unverified because SQL is absent. General-note attribution is also unresolved because the direct insert omits `user_id`.

### Unverified expectations

The formal pilot may improve progress visibility, reduce repeated check-ins, clarify end-of-day reporting, and make correction of entry errors safer. These are hypotheses to test, not outcomes to report.

### Metrics still needing collection

No verified baseline or pilot dataset is committed for reporting time, check-in frequency, usage, errors, satisfaction, accessibility, or reliability. Historical Lighthouse scores supplied by the owner are not a current test result and should not be used as formal-pilot evidence without a dated report and test conditions.

## Formal pilot entry checklist

### Governance and ownership

- [ ] Name the pilot sponsor, product owner, technical maintainer, data steward, and support contact.
- [ ] Confirm pilot participants, roles, sites/areas, start/end dates, and stopping criteria.
- [ ] Obtain required FWPS vendor, privacy, security, hosting, and acceptable-use approvals.
- [ ] Confirm that no student records or student PII will be entered.
- [ ] Approve the data-retention, backup, recovery, incident, and account-offboarding procedures.

### Technical readiness

- [ ] Export and review the live database schema, RLS policies, grants, triggers, and all RPC definitions.
- [ ] Confirm the production deployment and Supabase project/environment; verify secrets are server-only.
- [ ] Run `npm run lint` and `npm run build` from the pilot commit.
- [ ] Test intern, supervisor, admin, authenticated-but-unauthorized, and signed-out scenarios.
- [ ] Test numerical update consistency, boundary values, concurrent updates, general-note attribution, submitter visibility, total-COW audit history, delete-and-reverse, user lifecycle, and reset failure/recovery.
- [ ] Take a recoverable backup or approved export before destructive tests/reset, and verify the reset route's all-zero-UUID exclusion behaves as intended.
- [ ] Complete keyboard, screen-reader, zoom, mobile, contrast, and error-message accessibility checks.
- [ ] Define the support/escalation channel and rollback decision-maker.

### Workflow readiness

- [ ] Observe and record the pre-pilot workflow/baseline using approved methods.
- [ ] Prepare a short role-specific walkthrough and written quick reference.
- [ ] Define which system is authoritative during the pilot and how duplicate spreadsheets/processes will be handled.
- [ ] Explain update types, room/location notes, corrections, role boundaries, and forbidden data.
- [ ] Define when supervisors review the dashboard and how end-of-day status is closed.
- [ ] Prepare a consistent feedback form and issue log.

## Recommended pilot procedure

1. **Baseline:** observe representative refresh work before introducing the tool; record approved time/process measures without collecting unnecessary personal data.
2. **Walkthrough:** train the whole pilot team together, then verify each participant can complete only their role's tasks.
3. **Controlled start:** use a limited set of schools/areas and a defined support window.
4. **Daily monitoring:** review failed actions, inconsistent counts, anonymous updates, access issues, correction events, and user questions.
5. **Change control:** label issues by severity; make only approved, tested fixes during the active pilot and record what changed.
6. **Closeout:** export approved aggregate evidence, administer feedback, compare with the baseline, document limitations, and decide whether to iterate, pause, or expand.

## Metric collection plan

All metrics below are **proposed**. Obtain stakeholder approval for definitions and collection, prefer aggregate/minimal data, and record denominator, time window, source, and limitations.

| Metric | Operational definition | Suggested source/method | Why it matters |
| --- | --- | --- | --- |
| Approved users | Accounts authorized for the pilot, excluding test/service accounts | Approved participant roster + profiles review | Pilot reach and access control |
| Active users | Approved users completing a defined meaningful action during the window | Approved aggregate activity query; definition fixed before pilot | Adoption without inflating logins |
| Submitted updates | Created activity records, separated by numerical update/general note | Aggregate database query | Workflow usage; not impact by itself |
| Schools tracked | Distinct pilot schools with approved activity | Aggregate query | Scope/coverage denominator |
| COWs recorded | Sum of approved completed-COW effects and/or current aggregate, with corrections explained | Database query plus reconciliation | Operational throughput; avoid double-counting |
| Damaged devices recorded | Current total and event count reported separately | Database query plus reconciliation | Exception visibility |
| Supervisor usage | Defined review sessions/actions per supervisor, if approved | Short check-in log or privacy-approved events | Oversight adoption |
| Reporting time | Median time to prepare/communicate end-of-day status under baseline vs pilot | Timed observation or participant log with same start/end rule | Tests efficiency hypothesis |
| Repetitive check-ins | Count per comparable work period, using a fixed definition | Structured observation/sample log | Tests communication hypothesis |
| Data errors | Count/type of verified incorrect entries and corrections | Issue/correction log | Data quality and learnability |
| User satisfaction | Same short Likert items plus optional comments before/after or at closeout | Approved anonymous/minimal survey | Perceived usefulness and usability |
| Visibility clarity | Response to scenario/task or standardized survey item | Short task-based check + survey | Tests whether users can interpret progress |
| Feature adoption | Eligible users using each core workflow at least once | Aggregate query or structured observation | Finds unused/confusing workflows |
| Feedback-driven changes | Count of documented issues that produced an approved change | Issue-to-change log | Demonstrates monitoring/control |
| Workflows reduced/replaced | Named manual steps retired by stakeholder decision | Before/after process map and sponsor sign-off | Organizational value; do not infer from usage |

The current schema has no dedicated analytics or immutable admin-audit table. Avoid silently repurposing operational records as comprehensive usage telemetry. If new telemetry is approved, document purpose, fields, access, retention, and consent/notice before implementation.

## DECA evidence package

Maintain a dated, privacy-reviewed project record containing:

- before/after workflow maps;
- stakeholder requirements and change decisions;
- scope, risks, timeline, and ownership;
- test plan and anonymized/aggregate results;
- issue log showing monitoring and corrective action;
- baseline and pilot metric definitions/results, including limitations;
- pilot feedback themes and resulting decisions; and
- lessons learned and evidence-based recommendations.

The defensible story is the management of a real improvement project: need identification, analysis, planning, stakeholder communication, implementation, monitoring, control, and measured evaluation. Do not substitute unverified technical features or historical Lighthouse scores for organizational impact.
