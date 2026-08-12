# Harness state

This file is the durable handoff state for Codex and Claude. Read it before work and update it after each meaningful implementation or verification cycle.

## Current task

- Goal: deploy Linkit to AWS account `625250728854` with HTTPS and persistent PostgreSQL storage.
- Status: COMPLETE — production stack and public HTTPS smoke tests verified
- Last updated: 2026-08-12
- Next action: add a custom domain and migrate PostgreSQL to RDS before critical production use.

## Evidence index

- [`preparation.md`](evidence/aws-deployment/preparation.md) — packaging verification and AWS provider constraints; `PASS`.
- [`production-verification.md`](evidence/aws-deployment/production-verification.md) — deployed stack, runtime, HTTPS, and security smoke tests; `PASS`.
- [`red.md`](evidence/handover-api-integration/red.md) — reload persistence E2E fails before API integration; expected `FAIL`.
- [`verification.md`](evidence/handover-api-integration/verification.md) — frontend/backend/full real-API E2E verification; `PASS`.
- [`review-remediation.md`](evidence/handover-api-integration/review-remediation.md) — post-implementation review findings and fixes; `PASS`.
- [`pr-body.md`](evidence/pr-body-draft/pr-body.md) — PR scope and current verification results; `PASS`.
- [`pr-creation-diagnosis.md`](evidence/pr-creation-diagnosis/pr-creation-diagnosis.md) — fork/upstream branch and PR-path diagnosis; `PASS`.
- [`direct-edit-cjk-final-manual-qa.md`](evidence/direct-edit-cjk-final/direct-edit-cjk-final-manual-qa.md) — responsive manual QA; `PASS`; high confidence.
- [`harness-bootstrap-manual-qa.md`](evidence/harness-bootstrap/harness-bootstrap-manual-qa.md) — shared entrypoint and state-link verification; `PASS`; high confidence.
- [`79b87c76-manual-qa.md`](evidence/handover-api-integration/79b87c76-manual-qa.md) — exact-commit runtime/manual QA matrix; `PASS`.
- [`environment-config.md`](evidence/handover-api-integration/environment-config.md) — development API target isolation and bundle check; `PASS`.
- [`red.md`](evidence/auth-routing/red.md) — missing anonymous/authenticated route redirects; expected `FAIL`.
- [`green.md`](evidence/auth-routing/green.md) — focused authentication-routing integration tests; `PASS`.
- [`verification.md`](evidence/auth-routing/verification.md) — lint, tests, build, strict scan, and route-surface verification; `PASS`.
- [`pr-handoff.md`](evidence/auth-routing/pr-handoff.md) — pushed branch, compare URL, and PR body location; `PASS`.

## Work loop

1. Read this file and the relevant evidence above.
2. Inspect the current source and reproduce the relevant behavior.
3. Implement the smallest correct change.
4. Run the narrowest meaningful verification and record the result.
5. Update this file with status, evidence, blockers, and the next action.

## Current handoff

- Completed: deployed the combined app and PostgreSQL to Graviton EC2 behind CloudFront HTTPS at `https://d1y43yo05gqvik.cloudfront.net`.
- Blockers: none for the requested deployment. RDS migration and a custom domain remain operational follow-ups.
- Verification: stack `CREATE_COMPLETE`; public pages, API behavior, containers, and secure CSRF cookie pass; see `evidence/aws-deployment/production-verification.md`.
