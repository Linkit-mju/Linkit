# Harness state

This file is the durable handoff state for Codex and Claude. Read it before work and update it after each meaningful implementation or verification cycle.

## Current task

- Goal: establish a shared agent work loop backed by saved Markdown state and verification evidence.
- Status: COMPLETE
- Last updated: 2026-08-11
- Next action: replace this task with the next active goal when work resumes.

## Evidence index

- [`direct-edit-cjk-final-manual-qa.md`](evidence/direct-edit-cjk-final/direct-edit-cjk-final-manual-qa.md) — responsive manual QA; `PASS`; high confidence.
- [`harness-bootstrap-manual-qa.md`](evidence/harness-bootstrap/harness-bootstrap-manual-qa.md) — shared entrypoint and state-link verification; `PASS`; high confidence.

## Work loop

1. Read this file and the relevant evidence above.
2. Inspect the current source and reproduce the relevant behavior.
3. Implement the smallest correct change.
4. Run the narrowest meaningful verification and record the result.
5. Update this file with status, evidence, blockers, and the next action.

## Current handoff

- Completed: the direct-edit/CJK responsive pass has a saved manual QA record; the shared Codex/Claude harness entrypoints now read and index durable state.
- Blockers: none recorded.
- Verification: see the linked manual QA evidence and harness bootstrap evidence.
