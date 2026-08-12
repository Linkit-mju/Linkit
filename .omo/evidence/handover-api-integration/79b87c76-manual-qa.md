# Manual QA — handover API integration commit 79b87c7

Date: 2026-08-12

## manualQa

### surfaceEvidence

| Scenario | Criterion | Surface | Exact invocation | Verdict | Artifact refs |
|---|---|---|---|---|---|
| S1 | frontend lint | frontend CLI | `cd frontend && npm run lint` | PASS | A1 |
| S2 | frontend unit/integration tests | frontend CLI | `cd frontend && npm test -- --run` | PASS | A2 |
| S3 | production typecheck/build | frontend CLI | `cd frontend && npm run build` | PASS | A3 |
| S4 | backend regression tests | Spring/Gradle CLI | `cd backend && env JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./gradlew test` | PASS | A4 |
| S5 | real authenticated handover CRUD and category cascade | Playwright Chromium + Vite (`npm run test:e2e`, backend already listening on `127.0.0.1:8080`) | PASS | A5 |
| S6 | diff whitespace integrity | git CLI | `git diff --check 79b87c76f52315e44b042f3909bebd3a141acce9^ 79b87c76f52315e44b042f3909bebd3a141acce9` | PASS | A6 |

### adversarialCases

| Scenario | Criterion | Adversarial class | Expected behavior | Verdict | Artifact refs |
|---|---|---|---|---|---|
| ADV1 | API-integrated persistence | reload persistence | created/edited/deleted handover state survives page reload against Spring API | PASS | A5 |
| ADV2 | category CRUD contract | cascade and selection fallback | deleting a category cascades its documents and leaves a valid selection | PASS | A5 |
| ADV3 | mutation safety | duplicate submit / single-flight | repeated submit while request is pending creates one resource | PASS | A5 |
| ADV4 | HTTP boundary | method normalization | category PATCH uses accepted uppercase HTTP method and succeeds | PASS | A5 |
| ADV5 | visual/screenshot QA | excluded scope | no visual verdict required because user explicitly excluded visual QA | NOT_APPLICABLE — explicitly excluded by request | A7 |

### artifactRefs

| ID | Kind | Description | Path |
|---|---|---|---|
| A1 | command-output | ESLint exited 0 | terminal output from `npm run lint` |
| A2 | command-output | 2 files / 3 tests passed | terminal output from `npm test -- --run` |
| A3 | command-output | TypeScript + Vite build succeeded; existing chunk warning only | terminal output from `npm run build` |
| A4 | command-output | Gradle `BUILD SUCCESSFUL` | terminal output from `./gradlew test` |
| A5 | command-output | 3 Chromium tests passed: auth validation, handover CRUD reload, category rename/delete cascade reload | `.omo/evidence/handover-api-integration/79b87c76-playwright-output.txt` |
| A6 | command-output | no whitespace errors | terminal output from `git diff --check` |
| A7 | harness-evidence | user/request scope excludes visual QA | `.omo/evidence/handover-api-integration/verification.md` |

## Overall verdict

PASS. All runnable functional gates passed on commit `79b87c76f52315e44b042f3909bebd3a141acce9`. A backend launch attempt was not needed for the E2E run because port 8080 was already occupied by a running service; Playwright completed all three real-browser scenarios successfully against it. The generated Playwright artifact directory was removed after capture.
