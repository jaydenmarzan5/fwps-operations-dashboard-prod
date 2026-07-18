# Roadmap

## Prioritization principles

Recommendations are proposals, not commitments. Priority favors reliability, data integrity, security/privacy, workflow fit, accessibility, stakeholder needs, and measurable value. Effort is a relative planning estimate and must be refined by the maintainer. “Risk” describes delivery/operational risk introduced or exposed by the work, not a formal security rating.

## Before the formal pilot

| Recommendation | Benefit | Effort | Risk | Dependency | Priority |
| --- | --- | ---: | --- | --- | ---: |
| Capture the live schema, RLS, grants, triggers, and all RPCs as reviewed migrations | Makes enforcement reproducible and permits accurate review/testing | Medium | High if deferred; migration capture must avoid production drift | Supabase admin access and database review | P0 |
| Complete district vendor/privacy/security/hosting review and define owner/support | Establishes authority, acceptable data, and accountability | Medium | High organizational risk if deferred | FWPS stakeholders | P0 |
| Verify/fix update attribution for every path, especially direct general notes | Ensures activity accountability and addresses pilot feedback | Small–Medium | Data lineage and privacy tradeoffs | Live trigger/RPC/RLS inspection | P0 |
| Test and harden authorization for every role and direct mutation | Confirms that hidden controls match backend enforcement | Medium | Unauthorized reads/writes if deferred | Versioned RLS/functions; role test accounts | P0 |
| Define backup/recovery and make reset/reversal tests recoverable | Reduces irreversible pilot-data loss | Medium | Destructive-test and recovery risk | Supabase backup/export capability; owner | P0 |
| Resolve multi-step consistency gaps (total change/history, reset, user deletion) | Prevents partial state and missing audit history | Medium | Requires careful database/API design | Migration baseline; transaction design | P1 |
| Define formal pilot scope, baseline, metric definitions, training, and stopping criteria | Produces usable DECA and stakeholder evidence | Small–Medium | Biased/incomparable results if vague | Sponsor and participants | P0 |
| Run current accessibility and role-based usability checks | Reduces barriers and onboarding errors | Medium | May identify launch-blocking work | Test participants and approved tools | P1 |
| Establish severity-based issue/change control for the active pilot | Protects stability while allowing urgent fixes | Small | Uncontrolled changes otherwise | Named product/technical owner | P1 |

## During the pilot

| Recommendation | Benefit | Effort | Risk | Dependency | Priority |
| --- | --- | ---: | --- | --- | ---: |
| Monitor failed writes, anonymous updates, count mismatches, access failures, and destructive actions daily | Detects integrity/security issues early | Small daily | Monitoring may collect personal data if overbroad | Approved logs/queries and owner | P0 |
| Collect the pre-approved baseline and pilot metrics with fixed definitions | Enables defensible impact evaluation | Medium | Privacy and measurement bias | Pilot plan and approvals | P0 |
| Conduct a whole-team walkthrough plus role-specific task checks | Improves shared expectations and workflow understanding | Small | Training time | Pilot schedule/materials | P0 |
| Keep a structured issue, decision, and feedback-to-change log | Connects stakeholder feedback to project control | Small | Sensitive comments need handling | Owner and retention rule | P1 |
| Limit changes to reliability, integrity, security, and severe usability fixes | Preserves comparability and stability | Variable | Emergency fixes can still disrupt data | Change-control owner and rollback | P1 |
| Reconcile aggregate school totals with sampled activity/history | Validates the core system of record | Small–Medium | May reveal schema/RPC defects | Approved query/check procedure | P1 |

## After the pilot

| Recommendation | Benefit | Effort | Risk | Dependency | Priority |
| --- | --- | ---: | --- | --- | ---: |
| Analyze results with denominators, limitations, and stakeholder sign-off | Produces credible DECA and organizational conclusions | Medium | Overclaiming if evidence is weak | Clean metric package | P0 |
| Decide continue, revise, pause, or retire; assign long-term ownership | Prevents unsupported “temporary production” use | Small decision / variable execution | Operational abandonment | Sponsor, security, technical owner | P0 |
| Add durable audit records for role changes, user lifecycle, resets, reversals, and mark-complete actions if approved | Improves accountability and incident reconstruction | Medium | Audit data itself needs access/retention controls | Approved event model and migrations | P1 |
| Improve loading/error/empty-state handling based on observed failures | Increases trust and usability | Medium | Scope creep if not evidence-driven | Pilot issue data | P1 |
| Address verified accessibility findings and retest | Supports equitable use and compliance readiness | Variable | Requires qualified review for formal conclusions | Accessibility results/owner | P1 |
| Add CSV export only if a defined reporting workflow needs it | Reduces manual transcription | Small–Medium | Data leakage and stale copies | Approved fields/access/retention | P2 |
| Add notifications only for approved, time-sensitive events | Reduces missed exceptions | Medium | Alert fatigue and contact-data governance | Event definitions and approved channel | P2 |

## Long-term possibilities

| Proposal | Potential benefit | Effort | Risk | Dependency | Priority |
| --- | --- | ---: | --- | --- | ---: |
| Broader damaged-device and room/location workflows | Extends value to an adjacent observed need | Medium–High | Scope/data-model drift; possible sensitive data | Validated workflow, owner, privacy review | P2 |
| Support operations beyond Chromebook Refresh | Reuses a proven workflow platform | High | Generic design may weaken current fit | Successful measured pilot and discovery | P3 |
| Approved product analytics | Helps understand adoption and friction | Medium | Employee monitoring/privacy concerns | Explicit purpose, minimal event model, retention approval | P3 |
| Integrations with approved district systems | Reduces duplicate entry | High | Vendor/API/security and source-of-truth complexity | Named integration need and system approval | P3 |
| Read-only AI/RAG assistant over approved procedures | May speed access to procedural guidance | High | Incorrect answers, access leakage, maintenance, uncertain value | Curated corpus, evaluation, governance, proven user need | P4 |
| Secure tool calling for live operational questions | Could answer current-state questions conversationally | Very high | Authorization, prompt injection, audit, data leakage | Mature APIs, least privilege, threat model, evaluation | P4 |

AI/RAG should not precede reliable source data, versioned permissions, governance, and a demonstrated workflow need. A read-only procedural experiment is safer than granting an assistant mutation authority, but it still requires approval and evaluation.

## Top five sequence

1. Version and review the live database/RLS/RPC implementation.
2. Obtain district governance decisions and assign operational/technical ownership.
3. Close attribution, authorization, transaction, backup, and destructive-action integrity gaps.
4. Execute a scoped formal pilot with training, baselines, and approved measurements.
5. Use the evidence to decide continued use and only then add auditability/accessibility/usability improvements or narrowly justified features.
