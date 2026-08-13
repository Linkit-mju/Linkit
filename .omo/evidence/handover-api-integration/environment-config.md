# Frontend API target environment configuration

- Date: 2026-08-12
- Verdict: PASS

## Change

- The browser continues to call the same-origin relative path `/api`.
- Vite reads the development-only proxy target from `frontend/.env` as `API_PROXY_TARGET`.
- `frontend/.env` is ignored by Git; README documents the required key without committing a server address.
- The variable deliberately has no `VITE_` prefix, so Vite does not expose it to client code.

## Verification

- `npm run lint`: PASS.
- `npm test -- --run`: PASS, 2 files / 3 tests.
- `API_PROXY_TARGET='' npm test -- --run`: PASS; clean-clone unit tests do not require the ignored local file.
- `npm run build`: PASS.
- `npm run test:e2e`: PASS, 3 Chromium scenarios against the real backend.
- `git check-ignore -v frontend/.env`: PASS; the local file is ignored.
- Built `frontend/dist` search for `API_PROXY_TARGET` and the local proxy address: PASS; no matches.

Visual QA was not run because the user explicitly excluded it.
