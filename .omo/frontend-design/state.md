# Frontend design state

## Current Objective

- 2026-08-11: Create a public landing-page draft for Linkit that explains the student-council handover product and routes visitors to signup, login, or the workspace.

## Locked Decisions

- Reuse Astryx and `theme-neutral`; no new visual framework or landing-only CSS.
- Preserve the existing quiet, dependable workspace identity.
- Use a warm, document-first landing rhythm informed by the bundled Notion reference without copying brand assets or copy.
- Do not invent customer counts, testimonials, or outcome statistics.

## Design Brief

- Primary users: incoming and outgoing Myongji University student-council members.
- Primary journey: understand the continuity problem, see the structured handover format, then create an account or sign in.
- Tone: clear, practical, calm, and peer-to-peer.
- Anti-reference: generic gradient SaaS hero, unsupported social proof, decorative animation, and equal-weight feature-card clutter.

## Inclusive Personas

- New executive member: unfamiliar with prior-term vocabulary; needs plain-language explanation and visible information hierarchy.
- Outgoing officer under time pressure: needs to recognize that existing notes can become a reusable handover structure.
- Mobile campus user: needs natural Korean wrapping and no horizontal scrolling at narrow widths.

## Adaptive Preferences

- Follow Astryx focus, contrast, reduced-motion, and responsive defaults.
- Korean display and body copy use balanced or pretty wrapping where supported.

## Verification Matrix

- User opted out of manual/browser visual QA on 2026-08-11.
- Minimum verification: TypeScript build, ESLint, Vitest, and affected Playwright route tests.

## Design Debt Register

- Landing proof uses representative product data until verified customer evidence exists; affects persuasion strength, not task access.
