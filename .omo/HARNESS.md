# Harness state

This file is the durable handoff state for Codex and Claude. Read it before work and update it after each meaningful implementation or verification cycle.

## Current task

- Goal: connect the handover page category and document CRUD flows to the Spring API, then create the PR.
- Status: IN PROGRESS
- Last updated: 2026-08-12
- Next action: commit and push the verified integration, then create the cross-fork PR.

## Evidence index

- [`red.md`](evidence/handover-api-integration/red.md) — reload persistence E2E fails before API integration; expected `FAIL`.
- [`verification.md`](evidence/handover-api-integration/verification.md) — frontend/backend/full real-API E2E verification; `PASS`.
- [`review-remediation.md`](evidence/handover-api-integration/review-remediation.md) — post-implementation review findings and fixes; `PASS`.
- [`pr-body.md`](evidence/pr-body-draft/pr-body.md) — PR scope and current verification results; `PASS`.
- [`pr-creation-diagnosis.md`](evidence/pr-creation-diagnosis/pr-creation-diagnosis.md) — fork/upstream branch and PR-path diagnosis; `PASS`.
- [`direct-edit-cjk-final-manual-qa.md`](evidence/direct-edit-cjk-final/direct-edit-cjk-final-manual-qa.md) — responsive manual QA; `PASS`; high confidence.
- [`harness-bootstrap-manual-qa.md`](evidence/harness-bootstrap/harness-bootstrap-manual-qa.md) — shared entrypoint and state-link verification; `PASS`; high confidence.
- [`79b87c76-manual-qa.md`](evidence/handover-api-integration/79b87c76-manual-qa.md) — exact-commit runtime/manual QA matrix; `PASS`.
- [`environment-config.md`](evidence/handover-api-integration/environment-config.md) — development API target isolation and bundle check; `PASS`.

## Work loop

1. Read this file and the relevant evidence above.
2. Inspect the current source and reproduce the relevant behavior.
3. Implement the smallest correct change.
4. Run the narrowest meaningful verification and record the result.
5. Update this file with status, evidence, blockers, and the next action.

## Current handoff

- Completed: connected handover category/document CRUD to the Spring API, serialized saves against duplicate submissions, normalized HTTP methods, stabilized the H2 dev lifecycle, covered category cascade behavior, and moved the development proxy target into an ignored frontend `.env` file.
- Blockers: none; visual QA is explicitly excluded by the user.
- Verification: all automated gates pass after review remediation and environment isolation; see `verification.md`, `review-remediation.md`, and `environment-config.md`. Two pre-existing transitive development dependency advisories remain outside this change.
