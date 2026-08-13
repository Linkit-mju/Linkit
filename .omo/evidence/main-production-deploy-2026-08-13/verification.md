# Main production deployment verification

- Date: 2026-08-13
- Target: `origin/main` at `d9dbe616dddc4777c7073f70bcbfccc63e7b402e`
- Environment: AWS `ap-northeast-2`, stack `linkit-production`
- Verdict: PASS

## Verification

- `git fetch origin main`: PASS; `origin/main` advanced from `d5ef9ab` to `d9dbe616`.
- `aws login`: PASS; authenticated to account `625250728854`.
- AWS stack inspection: PASS; `linkit-production` is `CREATE_COMPLETE` in `ap-northeast-2`.
- Exact-main image build and ECR push: PASS; frontend Vite build and backend `bootJar` succeeded.
- Initial deployment: expected `FAIL`; production had an earlier handover migration recorded as `V2`, while merged `main` independently reused `V2` for organizations.
- Automatic rollback: PASS; the previous image was restored and public `/`, CSRF, and anonymous session checks returned `200`, `200`, and `401`.
- Compatibility migration image: PASS; application source is `d9dbe616`, existing deployed `V2` bytes are preserved, and the organization migration is moved to unused `V4`; final schema remains equivalent to current main.
- Upgrade rehearsal: PASS; a temporary PostgreSQL database initialized by the old production image upgraded through Flyway `V1` to `V6`, exposed the CSRF API, and contained all eight required domain tables.
- ECR image: `linkit:main-d9dbe616-compat1`, manifest digest `sha256:d21cb4415f2b133ad2a684ef94b4214121a60aa11128672bc88786e9db0179ee`.
- Production container update through SSM: PASS; command `cbd1f97e-1c72-49c6-b6db-7f3084bbd4df` completed with response code `0`.
- Server-side verification: PASS; the expected image is running, internal CSRF responds, Flyway reports `1:true` through `6:true`, and all eight required tables exist.
- Public HTTPS smoke tests: PASS; `/`, `/login`, and `/api/v1/auth/csrf` return `200`; anonymous `/api/v1/auth/me` returns the designed `401`; the CSRF cookie has `Secure`.
- Authenticated-only `/organization-chart`: PASS; anonymous request returns `401` as designed.

## Next action

Commit a durable repository migration renumbering fix so future main images do not
need the deployment-only compatibility layout. The running database and volume were
preserved; no Flyway history rows were manually altered.
