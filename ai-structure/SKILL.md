---
name: portal-admin-angular
description: Architecture and component conventions for the admin portal template (Angular + Tailwind). Use when adding or changing any page, component, service, or style — even small tweaks. Ensures shared components are reused and the established architecture is not broken.
---

# Portal Admin Angular — Architecture & Shared Components

The goal: the portal stays consistent, easy to read, and free of duplicated components, even when many people (and AI) change it over time. The existing codebase is the source of truth. This skill tells you *how to work in it*; it does not describe a new architecture to migrate to.

Full component list and canonical names: `./component-catalog.md` (read it when you need to know what a component should be called, what variants it should support, or what belongs in `shared/`).

**Implementation tracking:** `./implementation-plan.md` — read this **before** implementing any component to check its current status and dependency phase. After finishing, update both files (set Status to `done` in the plan, `exists` in the catalog).

The catalog's *Detailed Specs* section (bottom of the file) covers Toast, Notification (inbox) and Icon. Read it before adding any user feedback message or any icon.

## 1. Workflow

### Step 0 — Discover (always, even for small tasks; takes 1-2 minutes)
Search the repo before writing anything:
- Folder layout of `src/app` (shared / features / core / layout, or whatever is actually used).
- Whether a component already does the job: search by name *and* by behavior (e.g. grep for `Dialog`, `Modal`, `Shimmer`, `Skeleton`, `Toast`, `DataTable`, `Badge`).
- The closest existing feature page that does something similar. Copy its pattern (service, state, routing, naming).
- Project facts in section 2 — confirm them from the code instead of assuming.

### Step 1 — Decide: reuse, extend, or create
```
1. Existing component fits            -> REUSE it
2. Fits but lacks a capability        -> EXTEND it (new input/variant/slot), keep old behavior working
3. Nothing fits, and it is generic    -> CREATE in shared/
4. Nothing fits, and it is domain-specific -> CREATE in features/<feature>/
```
Creating a component is the last resort because every duplicate is a future inconsistency: two buttons with slightly different padding, two loaders that animate differently. Extending the existing one fixes every screen at once.

### Step 2 — Plan (scale it to the task)
- Trivial change (text, a class, one existing component swapped in): no written plan, just do it.
- Non-trivial (new page, new component, touching shared code, more than ~3 files): write a short plan first: files reused, files modified, new files and why each is unavoidable, impact on other features. Do not plan folder moves or library swaps unless the user asked for a migration.

### Step 3 — Implement
Follow sections 3-8 below. Keep the change scoped to the request (section 9).

### Step 4 — Verify
Run what the project provides (check `package.json` scripts first, then typically `ng build`, `ng lint`, `ng test`). A change is not done if the build or lint fails. Then walk the checklist in section 10.

### Step 5 — Update the catalog
If you created or used a shared component for the first time, update its **Status** in `./component-catalog.md` in the same change. Remove `?` once the component is confirmed to exist or confirmed not needed (`n/a`).

## 2. Project facts to confirm (do not assume)
Fill these from the repo the first time; keep them current in this file when they change.

| Fact | Value (verify) |
|---|---|
| Angular version / standalone components? | Angular **22** · **Standalone** (no NgModule) |
| Component selector prefix | `app-` |
| State approach (signals / RxJS / NgRx) | **Signals** (`signal`, `computed`, `input`, `output`) · RxJS 7.8 for async streams |
| Forms approach (reactive / template / signal forms) | **Reactive forms** (`@angular/forms`) · `ControlValueAccessor` for shared controls |
| Tailwind version & where design tokens live | **Tailwind 4.x** · config via `@theme {}` in `src/styles.scss` (no `tailwind.config.js`) |
| Primary font family | **Montserrat** (local variable font in `public/font/` & `src/assets/font/`, weights 100-900) |
| Dark mode supported? (class / media / none) | **REQUIRED** · Full dark mode supported via `class="dark"` on `<html>` and semantic CSS tokens. All new pages and components MUST implement and support dark mode! |
| i18n / language support? | **REQUIRED** · Full multi-language support (English `en` & Vietnamese `vi`) via `TranslationService` & `TranslatePipe`. All text in any new UI or change MUST be translated! |
| Permission system (service, directive, guard) | Not yet — create in Phase 8 |
| Existing file naming (`x.component.ts` vs `x.ts`) | Standalone style: `button.ts` (no `.component` suffix) |
| Icon library in use (Lucide / Heroicons / Material / FA) | **`@lucide/angular`** (v2+) · Each icon is a standalone Angular component (`LucideUser`, `LucideBell`, etc.) · Rendered via `NgComponentOutlet` in `app-icon` · No `LucideAngularModule` · `NgComponentOutlet` from `@angular/common` |
| Existing toast solution (own `ToastService` / library) | None yet — build from scratch (Phase 6 #46) |
| Notification source (REST / WebSocket / SSE / none yet) | None yet — REST polling planned (Phase 7) |

If a fact is `TODO`, find it in the code; if the code is inconsistent, follow the newest/most common pattern and mention the inconsistency to the user.

## 3. Layers and dependency direction
```
core/       app-wide singletons: auth, interceptors, guards, config
layout/     shell: AdminLayout, Sidebar, Topbar, PageHeader
shared/     generic, reusable UI + pipes/directives/utils. Knows nothing about any feature.
features/   domain code: pages, containers, feature services, feature-specific components
```
Rules:
- `features/*` may import `shared/*` and `core/*`. `shared/*` must never import from `features/*`.
- One feature must not import from another feature's internals; move genuinely common code to `shared/`.
- Generic components contain no business rules and no HTTP calls. They receive data via inputs/signals and emit events.
- Data flow: `Component -> Feature service / facade -> API service -> HttpClient`.
- Keep one responsibility per component. A page = container + form + table config + dialogs, not one 800-line file.
- Do not create a second folder for something that already has a home (e.g. `shared/ui/table` next to `shared/components/table`).

## 4. Shared component API conventions
- Use variants/sizes instead of duplicate components: `<app-button variant="danger" size="sm">`, never `DangerButton`.
- Prefer the style already used in the **same module/file** (signal `input()`/`output()` on modern Angular, `@Input`/`@Output` otherwise). Do not mix both styles within a single component.
- Form controls implement `ControlValueAccessor` and support, where meaningful: label, placeholder, required, disabled, readonly, loading, error, hint, prefix, suffix.
- Expose the smallest useful API. Internal state stays private.
- Variant class maps must be complete literal strings (Tailwind cannot see classes built by string concatenation).
- New shared component checklist: default `ChangeDetectionStrategy.OnPush`, keyboard + focus + aria handled, dark-mode aware, responsive, documented in the catalog.

Example of the target shape:
```ts
@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="classes()">{{ label() }}</span>`,
})
export class StatusBadgeComponent {
  status = input.required<'active' | 'inactive' | 'pending' | 'error'>();
  // status -> label/class map lives here, once, for the whole app
}
```

## 4.1 Mandatory Dark Mode Standard for All New Pages & Components
Every new page or component created in this portal **MUST** strictly support Dark Mode:
1. **Semantic Design Tokens Only**:
   - `bg-background` for base page/screen background.
   - `bg-surface` for cards, dialogs, dropdowns, headers, and sidebars.
   - `bg-surface-raised` for secondary panels, table headers, hover effects.
   - `border-border` for card borders, separators, inputs.
   - `text-foreground` for headings and primary content.
   - `text-muted` for captions, hints, and secondary labels.
2. **Zero Hardcoded Static Colors**: Never use static colors like `bg-white`, `text-black`, `bg-slate-100` without token equivalents.
3. **Triple-Mode Support**: All components must look crisp across the 3 system modes:
   - `light` (`sun` icon)
   - `dark` (`moon` icon)
   - `system` (`monitor` icon)

## 5. Data-driven pages: the state model
Every page that loads data handles all of: loading, success, empty, error, no-permission.

```html
@if (loading()) {
  <app-loading-shimmer variant="table" />
} @else if (error()) {
  <app-error-state [message]="error()" (retry)="reload()" />
} @else if (items().length === 0) {
  <app-empty-state />
} @else {
  <app-data-table [columns]="columns" [rows]="items()" />
}
```
- Loading UI uses the shared `LoadingShimmer` (variants: text, title, avatar, button, card, table-row, table, input, image, custom; options: width, height, borderRadius, lines, animated). Never create `UserLoadingSkeleton`-style components; a feature-specific skeleton is acceptable only if it is *composed of* `LoadingShimmer` instances:
  ```html
  <!-- OK: feature skeleton composed from LoadingShimmer -->
  <app-loading-shimmer variant="avatar" />
  <app-loading-shimmer variant="text" lines="2" />
  ```
- Empty and error markup lives in `EmptyState` / `ErrorState`, not copy-pasted per page.
- Access control uses the project's permission mechanism (`PermissionGate`, guards, directive) and never hard-coded role strings in templates.

## 6. Tables, dialogs, notifications: one system each
- **Tables:** one `DataTable` in `shared/`, configured by columns/config from the feature. Server-side pagination/sort/filter supported via inputs/outputs. Do not add `UserTable`/`TicketTable` to `shared/` when only data differs. A feature table is legitimate only if it holds real domain behavior, and it still renders through `DataTable`.
- **Dialogs:** one dialog system (`Dialog`/`Modal`, `ConfirmDialog`, `Drawer`). Never hand-build `fixed inset-0` overlays.
- **Toast:** one `ToastService` + one container for transient action feedback. Alert/Banner are inline and persistent. Don't add a second toast/snackbar library.
- **Notification:** one inbox system (bell + panel + `NotificationService`) for persistent, read/unread events. It is separate from Toast; see the catalog's *Detailed Specs* for when to use which.
- **Icons:** one `Icon` component and one icon library. No raw `<svg>`, emoji, or `<img>` icons in features.
- **Status/roles:** `StatusBadge` / `RoleBadge` hold the mapping once.

## 7. Styling, theming, responsive, accessibility
- Tailwind only, following existing conventions. One-off styles: inline utilities. Repeated complex styling: extract to a component or token, not a custom CSS class.
- Use existing design tokens (`primary`, `secondary`, `success`, `warning`, `danger`, `muted`, `background`, `foreground`, `border`) — these are CSS custom properties surfaced as Tailwind classes via the design token plugin (e.g. `text-danger`, `bg-primary`). No hard-coded hex colors or arbitrary values that bypass tokens.
- Responsive across desktop / tablet / mobile with Tailwind breakpoints; no separate mobile/desktop components unless behavior truly differs.
- If dark mode exists, every new/changed component supports it through the theme tokens.
- Semantic HTML, visible focus, labels, `aria-*`, keyboard operation for dialogs/menus/tabs, and disabled/loading/error states exposed to assistive tech.

## 8. Angular practices
- Prefer standalone components and `inject()` if the codebase already does; follow the existing style otherwise.
- `@for` always with `track`; avoid function calls in templates for heavy work (use `computed`/pipes).
- Clean up subscriptions (`takeUntilDestroyed`, `async` pipe, or signals). No nested subscribes.
- Typed forms and typed models; no `any` for API data. Put interfaces in the existing models location.
- Lazy-load feature routes if that is how existing routes work.
- Never bypass Angular sanitization (`innerHTML`, `bypassSecurityTrust*`) without a stated reason.
- Add or update tests for shared components and non-trivial services when the project has a test setup.

## 9. Scope discipline
- "Add a user filter" means add a user filter. Do not also rename folders, restyle the layout, replace the table library, or rewrite forms.
- Refactor only when it removes real duplication in the code you are touching, keeps public behavior, and follows current architecture. Unrelated code that merely looks different from your preference stays untouched.
- Don't rename public component inputs/outputs or move files unless required; if required, update every usage.
- New dependency or second library for something already covered (tables, dialogs, toasts, date pickers, icons): ask the user first.

## 10. Definition of done
```
[ ] Searched the repo; reused or extended existing components
[ ] No duplicate component / folder / system introduced
[ ] New component (if any) is in the right layer and listed in the catalog with Status updated
[ ] Loading = LoadingShimmer, empty = EmptyState, error = ErrorState
[ ] Buttons, inputs, tables, dialogs, badges use the shared components
[ ] Permissions use the shared mechanism
[ ] Feedback uses ToastService / Alert / Notification correctly; icons use Icon
[ ] Multi-Language (i18n): All user-facing strings are translated in both English ('en') and Vietnamese ('vi') via TranslationService & TranslatePipe
[ ] Tokens only; responsive; dark mode preserved; keyboard/aria handled
[ ] Build, lint (and tests if present) pass
[ ] Only the requested scope changed
[ ] Self-reviewed against this checklist before opening a PR; reviewer checks it again
```

## 11. Mandatory Multi-Language (i18n) Requirement
**CRITICAL REQUIREMENT**: Every piece of UI, text, label, placeholder, error message, button, menu item, page title, tooltip, and dialog created or modified MUST support both English (`en`) and Vietnamese (`vi`).
- **TranslationService**: Lives in `src/app/core/services/translation.service.ts` (exported via `src/app/core`).
- **TranslatePipe**: Lives in `src/app/shared/pipes/translate.pipe.ts` (exported via `src/app/shared`).
- **HTML Templates**: Use `{{ 'key' | translate }}` or `{{ 'key' | translate:{ param: value } }}`.
- **TypeScript Logic**: Use `this.translation.t('key', { ... })` or reactive computed signals `computed(() => this.translation.t('key'))`.
- **Dictionaries**: The Single Source of Truth for translations is stored in:
  - `src/assets/i18n/en.json` and `src/assets/i18n/vi.json`
  - `public/i18n/en.json` and `public/i18n/vi.json`
  When adding any new UI text or feature, **ALWAYS** update both JSON files (`en.json` and `vi.json`). `TranslationService` automatically imports and flattens them into dot-notated keys (e.g. `'common.search'`, `'auth.signIn'`).
- **Hardcoding single-language text without multiple language translation is strictly forbidden.**

Short version: **look first, reuse, extend, create only when necessary, translate in both English and Vietnamese (en.json & vi.json), and never break the established architecture.**
