# Authentication-aware routing — red proof

- Date: 2026-08-12
- Verdict: FAIL (expected)
- Command: `cd frontend && npm test -- --run tests/integration/auth-page.test.tsx`
- Result: 1 passed, 2 failed.
- Missing behavior: an anonymous request to `/` remained on the handover page, and an authenticated request to `/login` remained on the login page.
