# Landing radial gradient adjustment

## Result

- Verdict: PASS
- Date: 2026-08-13
- Scope: full landing shell background, including the header.

## Change

- Moved the fixed radial gradient from `88% 18%` to `15% 35%`.
- Increased the theme-blue mix from `7%` to `12%` and the fade boundary from `52%` to `68%`.
- Applied the image-free, static gradient to the full-width `AppShell`, including the header and all landing sections.

## Verification

| Check | Invocation | Verdict | Detail |
|---|---|---|---|
| Lint | `cd frontend && npm run lint` | PASS | ESLint exited 0 |
| TypeScript + production build | `cd frontend && npm run build` | PASS | Vite build completed; existing chunk-size warning remains |
| Whitespace | `git diff --check` | PASS | no errors |
| Desktop browser visual QA | in-app browser at `1440px` | PASS | blue wash is visibly concentrated behind the left hero copy and fades before the next section |
| Desktop overflow | in-app browser DOM check | PASS | no horizontal overflow |
| Full-shell static verification | `cd frontend && npm run lint && npm test && npm run build` | PASS | header/content background overrides compile; 3 integration tests pass |
| Final visual QA | user review | SKIPPED | user explicitly requested to perform visual verification |
