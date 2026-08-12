# Organization chart UX verification

Date: 2026-08-13

## Scope

- Destructive warning before removing an officer from an active management term.
- Three-part phone input with automatic focus advance and normalized `000-0000-0000` persistence.
- JPG/PNG/WebP profile image selection and five-minute S3 presigned PUT upload.
- One empty vice-president node until the first vice-president is assigned.
- Separate chart display name and term label with edit support.
- Calendar-backed start and end date fields with mutual min/max constraints.

## Result

- Frontend lint: PASS
- Frontend TypeScript/Vite build: PASS
- Backend Gradle tests: PASS
- Frontend Vitest: PASS — 5 tests
- Impeccable detector: PASS — 0 findings
- Final backend regression: PASS — Gradle `BUILD SUCCESSFUL`
- Management delegation: PASS — a current management-term officer can designate another term; a confirmation explains automatic oldest-term revocation when two terms are already active.

## Deployment configuration

- `PROFILE_IMAGE_BUCKET`: private S3 bucket used for PUT uploads.
- `AWS_REGION`: bucket region; defaults to `ap-northeast-2`.
- `PROFILE_IMAGE_PUBLIC_BASE_URL`: CloudFront or readable object base URL.
- The bucket must allow browser `PUT` CORS from the Linkit frontend origin.
