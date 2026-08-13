# Authentication-aware routing — focused verification

- Date: 2026-08-12
- Verdict: PASS
- Command: `cd frontend && npm test -- --run tests/integration/auth-page.test.tsx`
- Result: 1 file, 3 tests passed.
- Covered behavior: anonymous `/` requests replace the URL with `/login`; authenticated `/login` requests replace it with `/`; existing login validation remains green.
