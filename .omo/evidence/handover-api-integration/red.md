# Handover API integration — red phase

Date: 2026-08-11

## Scenario

An authenticated user creates a category and handover through the UI, reloads the page, and expects the document to remain visible.

## Result

- Command: `npm run test:e2e -- --grep '추가한 인수인계'`
- Verdict: FAIL (expected red phase)
- Failure: `서버 저장 문서` was visible before reload and absent after reload at `tests/e2e/handover.spec.ts:73`.
- Root cause: `HandoverPage` still stores category and handover mutations only in local React state.

## Next action

Replace `INITIAL_*` loading and local CRUD mutations with the existing authenticated Spring API.
