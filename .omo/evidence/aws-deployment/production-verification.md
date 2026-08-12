# AWS production deployment verification

- Date: 2026-08-12
- Verdict: PASS
- Account: `625250728854`
- Region: `ap-northeast-2`
- Stack: `linkit-production` (`CREATE_COMPLETE`)
- URL: `https://d1y43yo05gqvik.cloudfront.net`
- Instance: `i-094fafe24507601f9` (`t4g.small`, ARM64)
- Image digest: `sha256:55e92b24703852489b6201881318eee2c9177985277c3cfbd1fbd1b7b042d0b8`

## Runtime verification

| Check | Result | Verdict |
|---|---|---|
| EC2 cloud-init | `status: done` | PASS |
| `linkit-db` container | running | PASS |
| `linkit-app` container | running | PASS |
| Internal `/api/v1/auth/csrf` | HTTP 200 | PASS |
| Public `/` | HTTP 200, title `Linkit` | PASS |
| Public `/login` | HTTP 200, title `Linkit` | PASS |
| Public `/api/v1/auth/csrf` | HTTP 200 | PASS |
| Anonymous `/api/v1/auth/me` | HTTP 401 as designed | PASS |
| CSRF cookie | `Secure` attribute present | PASS |
| CloudFront | enabled and deployed | PASS |
| Origin exposure | port 80 limited to CloudFront managed prefix list | PASS |

Frontend lint, unit tests, build, backend tests, and combined Docker build also
passed; see `preparation.md`. ECR scan-on-push is enabled, but the account did
not return a completed scan summary at verification time.

## Operational note

This is a cost-conscious MVP deployment. PostgreSQL persists in a Docker volume
on the instance's encrypted root EBS volume. Instance replacement would require
a database backup/restore; migrate to RDS before production data becomes critical.
