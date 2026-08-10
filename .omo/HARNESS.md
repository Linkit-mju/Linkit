# Harness state

This file is the durable handoff state for Codex and Claude. Read it before work and update it after each meaningful implementation or verification cycle.

## Current task

- Goal: create a service-fit public landing-page draft for Linkit.
- Status: COMPLETE
- Last updated: 2026-08-11
- Next action: gather stakeholder feedback on the landing copy and visual direction before production polish.

## Evidence index

- [`final-automated-verification.md`](evidence/linkit-landing-page/final-automated-verification.md) — lint, build, integration, and affected E2E verification; `PASS`; manual visual QA waived.
- [`implementation-cycle.md`](evidence/linkit-landing-page/implementation-cycle.md) — landing route red/green implementation cycle; `PASS`; automated focus check.
- [`direct-edit-cjk-final-manual-qa.md`](evidence/direct-edit-cjk-final/direct-edit-cjk-final-manual-qa.md) — responsive manual QA; `PASS`; high confidence.
- [`harness-bootstrap-manual-qa.md`](evidence/harness-bootstrap/harness-bootstrap-manual-qa.md) — shared entrypoint and state-link verification; `PASS`; high confidence.

## Work loop

1. Read this file and the relevant evidence above.
2. Inspect the current source and reproduce the relevant behavior.
3. Implement the smallest correct change.
4. Run the narrowest meaningful verification and record the result.
5. Update this file with status, evidence, blockers, and the next action.

## Current handoff

- Completed: service positioning and landing primitives are recorded; `/` renders the landing draft, `/workspace` preserves the handover surface, documentation names both routes, and automated verification passes.
- Blockers: none recorded.
- Verification: lint, production build, 3 integration tests, 2 affected Chromium E2E scenarios, production dev-tool gating, and diff integrity all pass; user explicitly opted out of manual/browser visual QA.
