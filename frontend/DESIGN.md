# Linkit Frontend Design System

## 1. Atmosphere & Identity

Linkit is a quiet, dependable handover workspace: dense enough for real operational knowledge, but never visually noisy. Its signature is a collapsible category rail that keeps the organization hierarchy visible while the selected handover reads like a calm working document.

The public landing page extends that identity with a warm, document-first rhythm inspired by Notion's readable marketing surfaces. It should feel like opening a well-organized handover binder, not a generic software sales page.

## 2. Color

Linkit uses `@astryxdesign/theme-neutral` without token overrides. The handover workspace uses dark mode to match the Astryx `shell-side-nav` reference; authentication keeps the existing light mode.

| Role | Astryx token | Usage |
|---|---|---|
| Body | `--color-background-body` | App backdrop |
| Surface | `--color-background-surface` | Main and navigation surfaces |
| Muted | `--color-background-muted` | Supporting panels |
| Primary text | `--color-text-primary` | Headings and body |
| Secondary text | `--color-text-secondary` | Metadata and help text |
| Accent | `--color-accent` | Primary actions and focus |
| Border | `--color-border` | Dividers and container edges |
| Status | Astryx semantic status tokens | Review, warning, and error states |

No product code may introduce raw color values.

## 3. Typography

Use Astryx `Heading` and `Text` semantic types only.

| Role | Astryx semantic token |
|---|---|
| Page title | `heading-1` |
| Section title | `heading-3` or `heading-4` |
| Body | `body` |
| Metadata | `supporting` |
| Labels | `label` |

Font stacks come from `--font-family-body` and `--font-family-heading`. Korean text must wrap by phrase where possible and never be forced into fixed-width text containers.

## 4. Spacing & Layout

- Base unit: Astryx 4px spacing scale (`--spacing-1`).
- Frame: `AppShell` with a fixed, collapsible `SideNav` and one scrolling `LayoutContent` region.
- Side navigation: Astryx default width and collapsible; resizing is omitted because the current Astryx handle creates horizontal overflow in this shell.
- Content: full-width shell with `LayoutHeader`; readable document content is constrained by Astryx `Layout` and stack primitives.
- Breakpoint behavior: rely on `AppShell` mobile navigation at `md`; the content reflows through wrapping `HStack` primitives.
- No handwritten layout CSS, raw layout `div`, or magic spacing values.
- Landing decision path: hook (`hero`) → explain (`problem/benefit`) → prove (`product preview`) → convert (`final CTA`).
- Landing sections alternate Astryx `transparent`, `section`, and `muted` surfaces. The existing Astryx spacing scale provides the generous document rhythm; no landing-only spacing scale is introduced.

## 5. Components

### Landing shell

- **Structure**: `AppShell` with `TopNav`, followed by stacked `Section` regions.
- **States**: desktop navigation, collapsed mobile navigation, login link, and one primary signup action.
- **Accessibility**: one `h1`, sequential `h2` headings, native navigation and main landmarks from Astryx, phrase-safe Korean wrapping.

### Landing hero

- **Structure**: centered `VStack` with an eyebrow label, display headline, supporting copy, and primary/secondary navigation links.
- **Content job**: name the continuity problem and promise a concrete outcome without unsupported metrics.
- **Responsive behavior**: semantic Astryx display type scales down through the theme; CTA links may wrap rather than compress.

### Product preview

- **Structure**: one elevated `Card` that composes `Badge`, `List`, `ListItem`, `Heading`, `Text`, and `Divider` into a credible handover document preview.
- **Content job**: prove the product through representative service content already used in the workspace, never through a pasted screenshot.
- **States**: review status, selected document, checklist progress, and reference metadata are expressed in text as well as color.

### Benefit grid

- **Structure**: responsive Astryx `Grid` containing three independently readable benefit `Card` items.
- **Content job**: explain the service around findability, repeatable structure, and continuity between terms.
- **Accessibility**: decorative icons are hidden from assistive technology; headings retain a sequential outline.

### Final CTA

- **Structure**: `Section` with a short heading, supporting sentence, and signup/login navigation.
- **Content job**: convert only after the product has been explained and shown.

### Handover shell

- **Structure**: `AppShell` → `SideNav` + `Layout` → `LayoutHeader` + `LayoutContent`.
- **States**: category expanded/collapsed, selected handover, empty category, search result empty.
- **Accessibility**: native landmarks from Astryx; visible labels for every action.
- **Motion**: Astryx component defaults only.
- **Scroll owner**: `LayoutContent`; header and side navigation remain fixed.

### Category navigation

- **Structure**: `SideNavSection` containing category group headers and nested handover `SideNavItem` nodes.
- **States**: default, selected child, empty, edit menu, delete confirmation.
- **Accessibility**: descriptive menu labels and explicit destructive confirmation.

### Handover document

- **Structure**: metadata cluster, summary, critical notes, recurring work, checklist, and references.
- **States**: draft, review, complete, empty field.
- **Accessibility**: status is always expressed with text; color is supplementary. The edit action is directly visible in the document header; deletion remains in an overflow menu.

### Editor dialogs

- **Structure**: `Dialog` + `Layout` + labeled Astryx inputs + fixed footer actions.
- **States**: create, edit, template selection when more than one template is available, validation error, cancel.
- **Accessibility**: `purpose="form"`, visible labels, first invalid field described inline.

### Toast feedback

- **Structure**: Astryx `useToast` viewport, triggered after a completed handover or category mutation.
- **States**: create, edit, and delete confirmation.
- **Accessibility**: messages are short, factual, and dismissible; form validation remains beside the invalid field, while irreversible deletion remains confirmed by `AlertDialog`.

## 6. Motion & Interaction

- Use Astryx `--duration-fast` and `--ease-standard` defaults.
- Motion only communicates hover, focus, press, selection, opening, or closing.
- Toast entry, exit, stacking, and reduced-motion behavior use Astryx defaults.
- Respect `prefers-reduced-motion` through Astryx defaults.
- No custom keyframes or layout-property animation.

## 7. Depth & Surface

Strategy: mixed Astryx neutral surfaces. The app shell uses tonal separation; document groups may use default or muted `Card` variants. Elevation is reserved for dialogs and popovers. No custom shadows.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- Target WCAG 2.2 AA.
- Every control has an accessible text label and visible focus state.
- Destructive actions require confirmation.
- Status is never conveyed by color alone.
- Primary content must remain usable at 375px without horizontal scrolling.

### Accepted Debt

| Item | Location | Why accepted | Exit |
|---|---|---|---|
| Frontend prototype uses in-memory seed data | Handover workspace | Backend is intentionally deferred in this delivery | Replace state mutations with the API contract in `docs/backend-handover-spec.md` |
| Landing proof uses representative product content instead of customer metrics or testimonials | Landing page | No verified adoption data or customer quotes exist in the repository | Replace only when approved, attributable evidence is available |
