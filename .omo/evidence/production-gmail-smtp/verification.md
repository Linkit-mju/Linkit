# Production Gmail SMTP

- Date: 2026-08-13
- Verdict: PASS

## Implementation

- Replaced the production SES runtime configuration with authenticated Gmail SMTP.
- Kept the Google app password in Secrets Manager and granted the EC2 role read access only to the supplied mail secret ARN.
- Configured `smtp.gmail.com:587`, SMTP authentication, STARTTLS, the Gmail sender, and the public frontend URL.
- Retained the provider-based mail implementation so local SMTP and future SES migration remain available.

## Verification

- Production secret structure validation without outputting its value: PASS.
- Production app-only rollout with rollback protection: PASS.
- Gmail STARTTLS authentication and delivery to `depth2026server@gmail.com`: PASS.
- Public `/` and CSRF endpoint: HTTP 200; PASS.
- Anonymous `/api/v1/auth/me`: HTTP 401 as designed; PASS.
- Browser-origin signup initially returned HTTP 403 with `Invalid CORS request`: expected diagnostic `FAIL`; production allowed only localhost origins.
- App-only recovery with `LINKIT_SECURITY_ALLOWED_ORIGINS` set to the CloudFront URL: PASS.
- Browser-equivalent signup request after recovery reaches application validation and returns the expected HTTP 400 for an invalid non-MJU address, with `Access-Control-Allow-Origin` set to the CloudFront URL: PASS.
- `backend/gradlew clean test --no-daemon`: PASS.
- Frontend lint, 5 tests, and production build: PASS; the existing duplicate accessible error text assertion was made multi-match aware.
- CloudFormation template validation: PASS; Gmail username, mail secret ARN, frontend URL, image URI, and CloudFront prefix-list parameters are recognized.
- Flyway production compatibility: PASS; repository `V2` is byte-identical to the migration recorded in production, while the organization migration moved unchanged to unused `V4`.
- Deployment script `bash -n`: PASS.
- GitHub Actions workflow YAML parse: PASS.
- `git diff --check`: PASS.
- AWS GitHub OIDC provider: PASS; created for `token.actions.githubusercontent.com`.
- AWS role `linkit-github-production`: PASS; trust is restricted to `Linkit-mju/Linkit` main and permissions are limited to the Linkit ECR repository plus SSM deployment/result access for the production instance.

## Deployment safety

Do not update the existing CloudFormation stack directly while PostgreSQL remains
on the instance root volume: changing EC2 user data may replace the instance and
delete the database volume. Deploy merged application images by replacing only
the `linkit-app` container until PostgreSQL is migrated to RDS or backed up.
