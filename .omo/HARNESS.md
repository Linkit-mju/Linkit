# Harness state

This file is the durable handoff state for Codex and Claude. Read it before work and update it after each meaningful implementation or verification cycle.

## Current task

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

- Completed: deployed the combined app and PostgreSQL to Graviton EC2 behind CloudFront HTTPS at `https://d1y43yo05gqvik.cloudfront.net`.
- Blockers: none for the requested deployment. RDS migration and a custom domain remain operational follow-ups.
- Verification: main-base lint/build/backend tests/Docker build and deployed runtime checks pass; see `evidence/aws-deployment/preparation.md` and `evidence/aws-deployment/production-verification.md`.
