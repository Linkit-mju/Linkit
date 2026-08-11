---
version: 1
slug: "frontend-src-organization-organizationjoinpage-tsx"
primary_target: "frontend/src/organization/OrganizationJoinPage.tsx"
related_targets: ["frontend/src/organization/OrganizationJoinSuccessPage.tsx","frontend/src/dashboard/DashboardPlaceholderPage.tsx"]
---

# Organization invitation join

- Scope: `/organization/join` and its success placeholder; visitor mode is Operate.
- Audience/job: an authenticated MJU student enters the six-character code received from an organization administrator to join a pre-seeded organization.
- Primary action: normalize and submit one alphanumeric invite code. The action remains disabled until six characters are present.
- States: incomplete, submitting, invalid code, already joined with a dashboard route, and successful join leading to the temporary `[1-0-2]` successor route.
- Direction: a single-task operating desk that keeps the field, validation, and recovery action in one stable panel; no organization creation path or competing action.
- Constraints: Korean UI, Astryx components and tokens, keyboard focus, non-color error text, authenticated CSRF-protected API, and no claims beyond seeded organization data.
- Open decision: replace `/organization/join/success` with the final `[1-0-2]` destination when that screen is implemented.
