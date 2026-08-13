# Harness state

## Current task — implement production verification email

- Goal: replace missing production SMTP configuration with AWS-native verification email delivery.
- Status: BLOCKED — AWS requested more information; Basic Support prevents replying through the CLI
- Last updated: 2026-08-13
- Completed: conditional SES sender, local SMTP fallback, EC2 IAM permission, deployment parameters, regression verification, Gmail sender verification, and SES production-access submission.
- Sender: `depth2026server@gmail.com` (`SUCCESS`, `ap-northeast-2`).
- Next action: paste the prepared use-case response into Support Center case `178660167400305`, obtain production access, then deploy and test real `@mju.ac.kr` delivery.

## Current task — SES implementation PR

- Goal: publish the current AWS SES verification-mail implementation as a reviewable PR.
- Status: COMPLETE — committed, pushed, and opened as PR #9
- Last updated: 2026-08-13
- Branch: `feat/aws-ses-verification-email`
- Commit: `01849ff`
- PR: `https://github.com/Linkit-mju/Linkit/pull/9`
- Verification: backend tests, CloudFormation validation, and diff check pass.
- Next action: review and merge PR #9; activate SES in production only after AWS approves sandbox removal.

## Current task — diagnose production signup failure

- Goal: identify why production signup shows a generic request failure.
- Status: COMPLETE — missing production SMTP configuration confirmed
- Last updated: 2026-08-13
- Blocker: no production SMTP provider or credentials are configured.
- Next action: configure SMTP and `FRONTEND_BASE_URL`, restart the app container, and verify real email delivery.

## Current task — deploy current main

- Goal: deploy the current `origin/main` commit to the existing AWS production environment.
- Status: COMPLETE — current main application deployed with production-safe Flyway compatibility
- Last updated: 2026-08-13
- Target: `d9dbe616dddc4777c7073f70bcbfccc63e7b402e`
- Deployment: `linkit:main-d9dbe616-compat1` at `sha256:d21cb4415f2b133ad2a684ef94b4214121a60aa11128672bc88786e9db0179ee`
- Next action: commit a durable migration-version reconciliation to main; the deployed compatibility image already preserves production data and reaches the intended V1–V6 schema.
## Current task — my page

- Goal: add an authenticated page for account identity and organization profile management.
- Status: COMPLETE — frontend and backend implementation verified
- Last updated: 2026-08-13
- Next action: review the page in the running app, then commit/push when requested.

## Current task — organization chart UX hardening




- Goal: harden destructive role removal, structured phone entry, profile uploads, term naming, and calendar date editing.
- Status: COMPLETE —
- implementation and regression verification passed
- Last updated: 2026-08-13
- Next action: configure the profile image S3 bucket/CORS and restart the backend when preserving or migrating current local H2 data is arranged.

This file is the durable handoff state for Codex and Claude. Read it before work and update it after each meaningful implementation or verification cycle.

## Current task

- Goal: connect handover CRUD and authentication-aware frontend routing to the Spring API, then create the PR.
- Status: READY FOR PR — route guard verified, committed, and pushed
- Last updated: 2026-08-12
- Next action: user creates the cross-fork PR from the recorded compare URL.

## Evidence index

- [`verification.md`](evidence/production-ses-mail/verification.md) — SES sender implementation, tests, infrastructure validation, and external readiness blocker; `BLOCKED`.

- [`verification.md`](evidence/production-signup-mail-diagnosis/verification.md) — production signup failure caused by absent SMTP configuration; `FAIL`.

- [`verification.md`](evidence/main-production-deploy-2026-08-13/verification.md) — current main image build, migration compatibility rehearsal, AWS rollout, and production smoke tests; `PASS`.
- [`verification.md`](evidence/my-page/verification.md) — my page API, UI, build, and regression verification; `PASS`.

- [`verification.md`](evidence/organization-chart-ux/verification.md) — organization chart UX, API, storage and regression verification; `PASS`.

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
- Goal: deploy Linkit to AWS account `625250728854` with HTTPS and persistent PostgreSQL storage.
- Status: COMPLETE — deployment-only branch rebased onto `origin/main` and verified
- Last updated: 2026-08-12
- Next action: add a custom domain and migrate PostgreSQL to RDS before critical production use.

## Evidence index

- [`preparation.md`](evidence/aws-deployment/preparation.md) — packaging verification and AWS provider constraints; `PASS`.
- [`production-verification.md`](evidence/aws-deployment/production-verification.md) — deployed stack, runtime, HTTPS, and security smoke tests; `PASS`.

## Work loop

1. Read this file and the relevant evidence above.
2. Inspect the current source and reproduce the relevant behavior.
3. Implement the smallest correct change.
4. Run the narrowest meaningful verification and record the result.
5. Update this file with status, evidence, blockers, and the next action.

## Current handoff

- Completed: connected handover CRUD and committed a `/api/v1/auth/me` session guard for authenticated/anonymous route redirects at `f4beeb5`.
- Blockers: none; Chromium and screenshot QA are explicitly excluded, and browser PR submission is handed to the user.
- Verification: routing lint, tests, build, strict scan, and jsdom route-surface checks pass; see `evidence/auth-routing/verification.md`. Existing backend and handover verification remains recorded under `evidence/handover-api-integration/`.
- Completed: deployed the combined app and PostgreSQL to Graviton EC2 behind CloudFront HTTPS at `https://d1y43yo05gqvik.cloudfront.net`.
- Blockers: none for the requested deployment. RDS migration and a custom domain remain operational follow-ups.
- Verification: main-base lint/build/backend tests/Docker build and deployed runtime checks pass; see `evidence/aws-deployment/preparation.md` and `evidence/aws-deployment/production-verification.md`.
