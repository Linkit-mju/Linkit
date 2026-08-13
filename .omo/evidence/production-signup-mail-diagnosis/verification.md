# Production signup mail diagnosis

- Date: 2026-08-13
- Verdict: FAIL
- Symptom: signup UI reports that the request could not be processed.

## Evidence

- Production application and Flyway migrations are healthy: PASS.
- The signup service saves the pending user and synchronously issues a verification email in the same transaction.
- Production container has no `MAIL_*` or `FRONTEND_BASE_URL` environment variables: FAIL.
- The application therefore defaults to SMTP `127.0.0.1:1025` and verification links based on `http://127.0.0.1:5173`.
- TCP port `127.0.0.1:1025` inside the production container is closed: FAIL.
- A mail-send exception rolls back signup and surfaces as the generic HTTP 500 message.

## Next action

Choose and configure a production SMTP provider, store its credentials in Secrets
Manager, inject the mail settings and public frontend URL into the app container,
then verify signup and delivery to an `@mju.ac.kr` address.
