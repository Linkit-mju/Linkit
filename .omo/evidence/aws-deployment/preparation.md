# AWS deployment preparation

- Date: 2026-08-12
- Verdict: PASS

## Verification

- `cd frontend && npm run lint`: PASS.
- `cd frontend && npm test`: PASS, 2 files / 5 tests.
- `cd frontend && npm run build`: PASS.
- `cd backend && ./gradlew test`: PASS.
- `docker build -t linkit:deploy .`: PASS; frontend and backend are packaged into one runtime image.
- AWS account `625250728854`, default region `ap-northeast-2`: PASS.

## Provider constraints discovered

- App Runner is unavailable in `ap-northeast-2`; endpoint and CloudFormation resource validation fail.
- App Runner in `ap-northeast-1` returns `SubscriptionRequiredException` for this new account.
- Lightsail Container creation returns the account service-limit error before creating a resource.
- No billable AWS resource was created during these failed attempts.

## Decision

Deploy the MVP in `ap-northeast-2` on one Graviton EC2 instance with an encrypted
volume, local PostgreSQL, ECR, and CloudFront HTTPS. This preserves same-origin
session and CSRF behavior and works within the account's currently enabled services.
