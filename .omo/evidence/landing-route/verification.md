# Landing page root route verification

## Result

- Verdict: PASS
- Date: 2026-08-14
- Scope: serve the public landing page at `/` and move the authenticated handover workspace to `/workspace`.

## Checks

| Check | Invocation | Verdict | Detail |
|---|---|---|---|
| Frontend integration | `cd frontend && npm test` | PASS | 3 files, 6 tests; root landing, protected workspace, login redirect, and existing feature tests pass. |
| Frontend lint | `cd frontend && npm run lint` | PASS | ESLint exited 0. |
| Frontend production build | `cd frontend && npm run build` | PASS | TypeScript and Vite build completed; existing bundle-size warning remains. |
| Backend SPA route | `cd backend && ./gradlew test --tests kr.ac.mju.linkit.auth.AuthControllerIntegrationTests` | PASS | Anonymous `/workspace` request forwards to `/index.html`; the client can perform its login redirect. |
| Local dev configuration | `cd frontend && npm run dev -- --host 127.0.0.1` | PASS | Git-ignored `.env` supplies `API_PROXY_TARGET`; Vite started without an inline environment variable. |
| Development routes | `curl -fsS -o /dev/null -w '%{http_code}' http://127.0.0.1:5175/{,workspace}` | PASS | `/` and `/workspace` each returned HTTP 200. |
| Whitespace | `git diff --check` | PASS | No whitespace errors. |
| Browser visual QA | in-app browser at local Vite URL | BLOCKED | Admin browser policy could not be verified and denied local URL access. |

## Route contract

- `/` renders the restored public landing page.
- `/workspace` is the authenticated handover route.
- Successful login and organization onboarding return to `/workspace`.
- Existing login, signup, verification, organization, organization-chart, and my-page paths are unchanged.
- The landing preview uses static representative content and does not call the protected handover API.
- Local `frontend/.env` points the Vite API proxy to the default Spring server at `http://127.0.0.1:8080`; the file remains excluded from Git.

## Verification note

The first landing test run exposed the missing jsdom `ResizeObserver` browser API used by Astryx `AppShell`. A minimal test-environment stub was added; the subsequent full frontend verification passed.
