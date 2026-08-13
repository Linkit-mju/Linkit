# Production SES verification mail implementation

- Date: 2026-08-13
- Verdict: BLOCKED

## Implementation

- Added an AWS SES v2 `VerificationEmailSender` selected with `MAIL_PROVIDER=ses`.
- Retained SMTP/Mailpit as the default for local development.
- Added the SES SDK through the existing AWS SDK BOM.
- Added UTF-8 sender request coverage for recipient, subject, and verification URL.
- Added CloudFormation parameters for the verified sender and public frontend URL.
- Granted the EC2 runtime role only `ses:SendEmail` for mail delivery.
- Configured new stack instances to use SES and public verification links.

## Verification

- `backend/gradlew test --no-daemon`: PASS; full backend suite and SES sender test passed.
- `aws cloudformation validate-template`: PASS.
- `git diff --check`: PASS.
- PR-branch re-verification on `feat/aws-ses-verification-email`: PASS; backend tests were up-to-date and successful, CloudFormation returned the expected parameters and IAM capability, and the diff check passed.
- SES identity `depth2026server@gmail.com`: PASS; verification status is `SUCCESS` in `ap-northeast-2`.
- SES production access request: AWS requested additional use-case information in support case `178660167400305`.
- Automated support-case response: BLOCKED; the account has Basic Support and the AWS Support API returned `SubscriptionRequiredException`.
- SES account remains sandboxed (`ProductionAccessEnabled=false`), so unverified `@mju.ac.kr` recipients cannot receive mail yet.

## Blocker and next action

Submit the prepared detailed response in AWS Support Center case
`178660167400305`, then deploy with `MAIL_FROM=depth2026server@gmail.com` after
approval. Activating SES while sandboxed would still make ordinary `@mju.ac.kr`
signup fail because recipients must be individually verified.
