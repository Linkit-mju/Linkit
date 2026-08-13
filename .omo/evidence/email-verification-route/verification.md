# Email verification route verification

Date: 2026-08-14

## Root cause

Spring Security permitted `/login` and `/signup` as public frontend routes, but not `/verify-email`. The frontend controller also forwarded only those two routes to `index.html`, so anonymous email-link navigation returned the authentication-entry-point JSON before React loaded.

## Fix

- Permit SPA page routes independently from API authorization.
- Forward `/verify-email`, `/verify-email/pending`, organization pages, organization chart, and my page to `index.html`.
- Keep API authorization rules unchanged.

## Result

- `AuthControllerIntegrationTests`: PASS
- Anonymous `GET /verify-email?token=mail-token`: PASS — forwards to `/index.html` with HTTP 200.
