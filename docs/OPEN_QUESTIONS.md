# Open Questions and Verification Register

These items require stakeholder, developer, platform administrator, or district confirmation. “Conflict” means supplied context is broader than the behavior that the repository alone can prove; it is not necessarily evidence that production is misconfigured.

## Immediate technical verification

| Question | Why it matters | Current evidence / owner needed |
| --- | --- | --- |
| What is the exact live schema, including types, defaults, constraints, keys, indexes, and triggers? | The project cannot be reproduced or fully reviewed from Git | Handwritten types/queries only; Supabase administrator |
| What RLS policies and grants exist for every table and role? | Client-side controls are not authorization | No SQL in Git; security/database reviewer |
| What are the exact definitions, security modes, search paths, grants, and transaction semantics of the three RPCs? | Update consistency, data minimization, and reversal guarantees live there | Call sites only; Supabase administrator |
| Does every general-note insert receive `auth.uid()` as `updates.user_id`? | Pilot feedback requires attribution | **Conflict:** broad context says new updates store `user_id`; `app/update/page.tsx` omits it; verify trigger/default or correct design |
| Does `submit_school_update` restrict fields/amounts, caller roles, bounds, and concurrency correctly? | Prevents arbitrary or inconsistent aggregate changes | External SQL required |
| Does `get_update_submitters` return only approved users/fields and only to approved callers? | Names are employee/intern account data | Client expects all needed `{id, full_name}` rows; external SQL required |
| Does `delete_update_and_reverse` independently verify admin, lock the row, prevent invalid totals, audit the action, and run atomically? | UI admin checks can be bypassed | **Conflict:** supplied behavior is not verifiable without SQL |
| Are direct profile role updates limited to admins and constrained to valid roles? | `app/admin/page.tsx` writes directly from the browser | RLS/check constraint absent from Git |
| Are direct school edits/history inserts limited to supervisors/admins? | UI role checks alone are insufficient | RLS absent from Git |
| Are authenticated users intended to access `/update` regardless of role? | Navigation exposes it to all signed-in users | Current UI is not intern-only; stakeholder/permission decision needed |
| Should “Mark Complete” create an attributed audit/update record? | It changes a core aggregate without repository-visible history | Current code performs only a direct school update |
| Should total-COW change plus history, user deletion, and reset be transactional? | Current repository paths can partially complete | Developer/database decision and recovery requirements |

## Pilot and product ownership

| Question | Why it matters |
| --- | --- |
| Who is the long-term product owner, technical maintainer, data steward, and support contact? | Defines accountability, access approvals, incident response, and maintenance |
| Who will participate in the formal pilot, in which roles/sites, and on what dates? | Scope and measurement cannot be finalized without participants/timeline |
| What are the pilot's success, pause, rollback, and stop criteria? | Prevents subjective or unsafe expansion |
| Which workflow/system is authoritative during the pilot? | Avoids duplicate or conflicting records |
| Which metrics and definitions are approved, and who may access the results? | Prevents unverified impact claims and inappropriate monitoring |
| Has the informal pilot history been documented with participants, conditions, findings, and consent/approval as needed? | Supplied context is not independently auditable |
| Should supervisors receive more, fewer, or different permissions? | Current supervisor functionality is limited to school controls; no separate supervisor view exists |
| May the application be used beyond Chromebook Refresh? | Scope expansion affects ownership, data design, privacy, support, and measurement |

## District, privacy, and security governance

| Question | Why it matters |
| --- | --- |
| Has FWPS formally approved the application and its current data use? | The repository does not prove organizational approval or district-wide adoption |
| Have Vercel and Supabase, including regions/configurations/subprocessors, passed required vendor/privacy/security review? | Supplied history names the vendors but no approval record exists |
| What account eligibility, email domain, password, MFA, session, recovery, and offboarding rules apply? | Supabase Auth settings are external |
| What employee/intern profile and operational-note data are permitted? | Notes could accidentally contain sensitive information |
| How will the prohibition on student records/student PII be trained, enforced, and monitored? | Product intent alone does not prevent entry |
| What are the retention, deletion, records, legal-hold, and acceptable-use requirements? | Reset currently permanently deletes activity/history |
| What audit events are required for user/role/destructive actions, and who can review them? | No durable admin audit model exists in Git |
| What incident response, breach notification, and secret-rotation procedures apply? | Service-role exposure or unauthorized access requires coordinated response |

## Hosting, operations, and recovery

| Question | Why it matters |
| --- | --- |
| What Vercel project, account, team, domains, branch, regions, and environment-variable scopes are authoritative? | **Conflict:** deployment is supplied context only; no configuration is in Git |
| Who can deploy or change Supabase/Vercel settings, and is change approval required? | Defines production control |
| What monitoring, alerting, logging, uptime expectation, and support window are required? | No observability/runbook is checked in |
| What are backup frequency, retention, restore objectives, and restore-test expectations? | Reset and database errors can destroy or corrupt operational history |
| What is the rollback procedure for application and database changes? | No deployment/migration rollback workflow exists |
| Should reset create a backup/export or a durable audit event first? | Current sequence permanently deletes data and is not visibly atomic |
| How are stale/inactive accounts reviewed and removed? | Long-term least privilege requires lifecycle management |

## Data, analytics, and accessibility

| Question | Why it matters |
| --- | --- |
| Which table is the source of truth when update history and school aggregates disagree? | Historical inconsistency motivated the RPC, but reconciliation is undefined |
| How should corrections, resets, and current totals be represented in pilot metrics? | Prevents double-counting or misleading throughput |
| Are product analytics allowed, and what minimal events, retention, notice, and access are approved? | Analytics may resemble employee monitoring and is not implemented |
| Are CSV exports allowed, and how would downloaded data be retained/protected? | Exports create uncontrolled copies |
| What accessibility standard, testing method, owner, and remediation threshold apply? | The historical Lighthouse score is not a current or complete accessibility review |
| Are room/location fields free text by design, and what validation/content guidance is needed? | Free text can be inconsistent or contain inappropriate/sensitive data |

## Repository/context contradictions already resolved in documentation

1. **Old README vs current code:** the previous README described authentication and roles as a “next step,” while current code implements them. The README has been updated to current behavior.
2. **RLS/atomic RPC claims vs Git:** supplied context describes protections and atomic behavior, but no policies/functions are version-controlled. Documentation labels these as externally configured and unverified.
3. **Universal update attribution vs direct note insert:** numerical RPC attribution is supplied context; direct general-note code omits `user_id`. Documentation does not claim complete attribution.
4. **Server-side privileged verification:** create/delete user and reset have repository-verified server checks; role edits, supervisor school changes, and update reversal do not have repository-visible server/SQL checks.
5. **Vercel production status vs deployment evidence:** Vercel is retained as supplied history, not repository-verified infrastructure or official adoption.
6. **Historical testing/scores vs current evidence:** manual production tests and Lighthouse scores are historical supplied claims without committed artifacts; they are not treated as current quality or impact measures.

Resolve an item by recording the decision/evidence in the appropriate source document and updating this register. Do not remove meaningful historical conflicts without noting how they were settled.
