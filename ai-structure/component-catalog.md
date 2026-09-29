# Shared Component Catalog (canonical names)

> **Last updated:** 2026-09-28 (updated) · **Context:** Admin portal template — components built once, displayed on a single showcase page, reused across features.

**Contents:** [Layout & navigation](#layout--navigation) · [Icons](#icons) · [Actions](#actions) · [Forms](#forms-controlvalueaccessor) · [Data display](#data-display) · [Overlays](#overlays) · [Feedback & states](#feedback--states) · [Authorization & app-level](#authorization--app-level) · [**Responsive requirements**](#responsive-requirements) · [Placement rule](#placement-rule-of-thumb) · [Updating this catalog](#updating-this-catalog) · [Detailed Specs](#detailed-specs-feedback-toast--notification-and-icon)

This is the *target vocabulary* for `shared/`. It is **not** a to-do list — do **not** build components just because they appear here. Build one only when a real feature needs it and it does not exist yet (verify with a search first).

Maintain the **Status** column as the library grows: `exists`, `planned`, or `n/a` (project doesn't need it). Unknown = `?` → the **first developer to use the component** is responsible for searching the repo, updating Status, and removing `?`.

## How to read this
- **Canonical** = the one name/component to use.
- **Do not create** = aliases that must be variants/config of the canonical one.
- **Responsive = required by default.** Every component must work correctly across all three tiers: mobile (< 768 px), tablet (768–1023 px), laptop/desktop (≥ 1024 px). See the [Responsive requirements](#responsive-requirements) section for per-component rules.

---

## Responsive requirements

> **Rule:** All shared components are mobile-first. Use Tailwind breakpoints — never create separate mobile/desktop component copies. If behavior genuinely differs between viewports (e.g. Sidebar becomes a Drawer on mobile), implement it as a **mode/prop** on the single canonical component.

### Tailwind breakpoints in use
| Prefix | Min-width | Target |
|---|---|---|
| *(none)* | 0 px | Mobile portrait — default styles |
| `sm:` | 640 px | Mobile landscape / large phone |
| `md:` | 768 px | Tablet portrait |
| `lg:` | 1024 px | Tablet landscape / laptop |
| `xl:` | 1280 px | Desktop |
| `2xl:` | 1536 px | Large desktop |

> Design tokens, spacing, and font sizes must be consistent across breakpoints. No hard-coded pixel values; use Tailwind utilities only.

### Per-component responsive rules

#### Layout & navigation
| Component | Mobile (< 768 px) | Tablet (768–1023 px) | Laptop / Desktop (≥ 1024 px) |
|---|---|---|---|
| `AdminLayout` | Single-column; Sidebar hidden by default | Sidebar can be collapsible icon-only rail | Full Sidebar visible |
| `Sidebar` | Rendered as an overlay Drawer; opened via hamburger in Topbar | Collapsible rail or mini mode | Full expanded sidebar; toggle button hidden |
| `Topbar` | Full width; hamburger button visible | Hamburger visible if Sidebar is rail | Hamburger hidden; full action bar |
| `PageHeader` | Title + actions stack vertically if actions overflow | Actions wrap or use a `...` overflow menu | Actions inline right |
| `Breadcrumb` | Collapse middle crumbs (show first + last + `…`) | Show up to 3 crumbs | Full crumb trail |
| `Tabs` | Horizontal scroll (no wrapping); consider condensed labels | Horizontal scroll or full | Full |
| `Stepper` | Steps scroll horizontally; nav buttons stack col-reverse | Horizontal or vertical | Horizontal |

#### Forms
| Component | Mobile | Tablet | Laptop / Desktop |
|---|---|---|---|
| All form controls | Full width (`w-full`) by default | Full width or 2-column grid layout | Can use multi-column grid (2–3 cols) |
| `FormField` | Stack label above control | Stack or inline label | Inline label option available |
| `Select` / `DatePicker` | Dropdown opens centered modal | Standard dropdown | Standard dropdown |
| `FileUpload` / `Dropzone` | Tap to select (no drag-drop on touch) | Drag-drop supported | Full drag-drop |

#### Data display
| Component | Mobile | Tablet | Laptop / Desktop |
|---|---|---|---|
| `DataTable` | Horizontal scroll (`overflow-x-auto`); consider hiding non-essential columns via `columnVisibility`; never break layout | Show most columns; some may be hidden | All columns visible |
| `Card` grid | 1-column stack | 2-column grid (`md:grid-cols-2`) | 3–4 column grid (`lg:grid-cols-3`) |
| `StatCard` grid | 1–2 columns | 2–3 columns | 4 columns |
| `Avatar` / `Badge` | Same size; no layout change | — | — |
| Charts | Full width; legend below chart; reduced font size on axes | Full width | Fixed max-width or full width |
| `PieChart` | Full width, legend stacks below | Full width | Fixed max-width |
| `QuickFilters` | Horizontal scroll or wrap; chips compact | Wrap inline | Wrap inline |
| `Pagination` | Single row `flex-row justify-between`; shows `X/Y` pill instead of page buttons | Shows page number list | Shows full list + first/last buttons |

#### Overlays
| Component | Mobile | Tablet | Laptop / Desktop |
|---|---|---|---|
| `Dialog` | Centered modal (`rounded-2xl`, `max-h-[90dvh]`, `p-4`); footer `justify-between` (Cancel left, action right) | Centered modal, max 90 vw | Centered, fixed max-width (sm/md/lg/xl sizes) |
| `Drawer` | Slides from bottom (full width) **or** from left/right (full height) | Slide from right, ~50–70 vw | Slide from right, fixed width (e.g. 480 px) |
| `Dropdown` | Full-width panel pinned to bottom of trigger | Standard dropdown | Standard dropdown |
| `Tooltip` | Disabled on touch (use `title` fallback or long-press); never rely on hover-only UX | Touch + hover | Hover |
| `CommandPalette` | `inset-x-4 top-16`; full width within padding | `left-1/2 -translate-x-1/2` centered | `left-1/2 -translate-x-1/2` centered |

#### Feedback & states
| Component | Mobile | Tablet | Laptop / Desktop |
|---|---|---|---|
| `Toast` / `ToastContainer` | Full width, pinned to bottom (safe from bottom bar); 1 column stack | Bottom-right or top-right stack, ~360 px wide | Top-right stack, 360 px wide |
| `NotificationPanel` | Full-screen Drawer | Popover, ~380 px | Popover, ~420 px |
| `Alert` / `Banner` | Full width, stacked actions | Full width | Full width |
| `EmptyState` / `ErrorState` | Centered, full width, icon smaller | Centered, max ~480 px | Centered, max ~560 px |

### Implementation checklist (per component)
When building or editing a shared component, confirm:
```
[ ] Default (no prefix) styles target mobile portrait
[ ] md: or lg: breakpoints add tablet/laptop layout
[ ] No separate mobile/desktop component copies created
[ ] DataTable wrapped in overflow-x-auto on mobile
[ ] Dialog always centered (no bottom-sheet); footer justify-between
[ ] Touch targets >= 44 x 44 px on mobile (buttons, links, icons)
[ ] Sidebar switches to Drawer mode on mobile via [mobile] prop
[ ] Toast pinned to bottom on mobile, top-right on md+
[ ] No horizontal overflow on any viewport
[ ] Tested at 375 px (iPhone SE), 768 px (iPad), 1280 px (laptop)
[ ] Dark mode tokens applied (no hard-coded colors)
```

---

## Layout & navigation
| Canonical | Notes | Do not create | Status |
|---|---|---|---|
| `AdminLayout` | Root shell; hosts Sidebar + Topbar + content outlet | — | `exists` |
| `Sidebar` (+ `SidebarItem`, `SidebarGroup`, `SidebarSubmenu`) | Collapsible rail on desktop (overlays header, not below); mobile slideout drawer; toggle button hidden on lg+; accordion nested dropdown menus | `MobileSidebar` copy | `exists` |
| `Topbar` | Contains `UserMenu`, `NotificationBell`, `ThemeSelector` slots; sidebar toggle hidden on lg+ | — | `exists` |
| `UserMenu` | Dropdown in Topbar; avatar + name + links | Inline user dropdown | `exists` |
| `Footer` | Site-wide footer in AdminLayout | Per-page footer markup | `exists` |
| `PageHeader` (+ actions slot) | Every page starts with `PageHeader`; accepts title, breadcrumb, action buttons | Per-page header markup | `?` |
| `ContentContainer` | Max-width wrapper + padding for page content | Inline `max-w-*` wrappers | `?` |
| `Breadcrumb` | — | — | `exists` |
| `Tabs` (+ `Tab`, `TabPanel`; `orientation="vertical"`) | — | `VerticalTabs` as a separate component | `exists` |
| `Pagination` | Single row `justify-between` on all viewports; reused by `DataTable` and standalone; shows compact `X/Y` pill on mobile | — | `exists` |
| `Stepper` | Multi-step forms/flows; horizontal steps + scroll on mobile; nav buttons col-reverse on mobile | — | `exists` |
| `CommandPalette` / `GlobalSearch` | One component; `Ctrl+K` trigger; full-width on mobile, centered on desktop | Two separate search overlays | `exists` |
| `Grid` (+ `GridCol`) | 12-column responsive layout container with breakpoint col spans (`spanSm`, `spanMd`, `spanLg`, `spanXl`) and `autoFit` fluid mode | Inconsistent ad-hoc grid classes | `exists` |

## Icons
| Canonical | Notes | Do not create | Status |
|---|---|---|---|
| `Icon` (`<app-icon name size label>`) + icon registry | Single icon system; uses the project's existing library; color via `currentColor`; decorative by default. See *Detailed Specs* below. | `DeleteIcon`/`UserIcon` per-icon components; a second icon library; raw `<svg>` in features | `exists` |

## Actions
| Canonical | Variants / states | Do not create | Status |
|---|---|---|---|
| `Button` | `variant`: primary, secondary, outline, ghost, danger, success, warning, link · `size`: xs, sm, md, lg · loading · disabled · `fullWidth` (also sets host `block w-full`) · optional icon slot | `DangerButton`, `SmallButton`, `LoadingButton` | `exists` |
| `IconButton` | Same variants as Button; requires accessible `label` input | Icon-only `<button>` with raw `<svg>` | `exists` |
| `ButtonGroup` | Group buttons into connected toolbar or segmented control · `orientation`: horizontal, vertical · `attached`: true/false · `size`, `variant` · optional data-driven `items` + `[(value)]` selection mode | Hand-rolled button toolbars with duplicate rounded borders | `exists` |

## Forms (ControlValueAccessor)

All form controls implement `ControlValueAccessor`. Common capabilities where meaningful: `label`, `placeholder`, `required`, `disabled`, `readonly`, `loading`, `error`, `hint`, `prefix`, `suffix`, `size`.

| Canonical | Notes | Do not create | Status |
|---|---|---|---|
| `FormField` | Label + hint + error wrapper; wraps any control | Per-control label/error markup | `exists` |
| `Input` | `type` prop covers text, password, number, currency, phone, search. Thin variant aliases (`PasswordInput`, `SearchInput`) are `type`/config wrappers only | `SearchInput2`, `SmallInput` as separate components | `exists` |
| `Textarea` | — | — | `exists` |
| `Select` | Single-select dropdown with real-time search and CVA binding | — | `exists` |
| `MultiSelect` | Multi-select dropdown with search, tag chips, checkboxes, select/clear all, and CVA binding | `MultiSelectNew` copies | `exists` |
| `Autocomplete` | — | — | `exists` |
| `Checkbox` | — | — | `exists` |
| `Radio` | — | — | `exists` |
| `Switch` | — | — | `exists` |
| `Slider` | — | — | `exists` |
| `DatePicker` | Single date picker popup with month-grid and decade year-grid navigation (click month/year header to switch grid level) | — | `exists` |
| `DateRangePicker` | Period interval selector; same month/year/decade navigation as DatePicker; quick presets (Today, Last 7 d, Last 30 d, This Month); dual range highlight | `DateRangePicker` hand-rolled copies | `exists` |
| `FileUpload` | + `Dropzone`, `FileList`/`FileItem`; `ImageUpload`/`AvatarUpload` are `accept`/preview config | Separate upload components per file type | `exists` |
| `OtpInput` | 6 individual digit boxes with auto-focus, paste support, backspace navigation, numeric/alphanumeric modes | Custom inline OTP boxes | `exists` |

## Data display
| Canonical | Notes | Do not create | Status |
|---|---|---|---|
| `DataTable` | One table system. Config-driven columns; search, filter, sort, pagination, selection, column visibility, loading, empty; client- and server-side modes. | `UserTable`, `TicketTable`, `ProductTable` in `shared/`; `DataGrid` alongside `DataTable` | `exists` |
| `Card` (+ `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) | Generic content container | Per-feature card markup | `exists` |
| `StatCard` | title, value, icon, trend, description, loading state | Inline stat markup | `exists` |
| `Avatar` (+ `AvatarGroup`, fallback initials) | — | — | `exists` |
| `Badge` | Generic label badge | — | `exists` |
| `StatusBadge` | Status → label/color mapping lives here once for the whole app | Inline status coloring in templates | `exists` |
| `RoleBadge` | Role → label/color mapping lives here once | Inline role coloring | `exists` |
| `Tag` / `Chip` | Removable labels, filter chips | — | `exists` |
| `QuickFilters` | Multi-select interactive filter bar with check indicators, active counts, and select/clear actions; responsive horizontal scroll on mobile | Inline filter button soup | `exists` |
| `StatusTag` | Tag-style pill with status-color mapping (same status→color map as `StatusBadge`). Wraps `Tag` — do **not** duplicate the color map. | Inline colored `<span>` per status | `exists` |
| `Accordion` | — | — | `exists` |
| `QrCode` | SVG QR code generator for 2FA authenticator pairing with manual secret key copy button | External heavy QR library wrapper | `exists` |
| `LineChart` | No API calls inside chart components. Uses chart library already in the project. | Wrapping a second chart library | `exists` |
| `BarChart` | Same rules as LineChart | — | `exists` |
| `AreaChart` | Same rules as LineChart | — | `exists` |
| `PieChart` / `DonutChart` | Responsive: full-width on mobile; `type` input switches between pie and donut. | Wrapping a second chart library | `exists` |
| `ChartCard` | `Card` + chart component; no data fetching inside | — | `exists` |
| `TreeView` | Hierarchical tree with recursive expandable nodes, 3-state cascading checkboxes (checked/unchecked/indeterminate), search filter, custom icons, and badges | Raw nested ul/li list markup | `exists` |

## Overlays
| Canonical | Notes | Do not create | Status |
|---|---|---|---|
| `Dialog` | **Canonical name.** `Modal` is a deprecated alias. Always **centered** (not bottom-sheet). Named slots: `[dialog-header]`, `[dialog-body]`, `[dialog-footer]`; sizes (sm/md/lg/xl/full); Esc to close. Footer uses `justify-between` — Cancel slot first (left), primary action second (right). | Hand-built `fixed inset-0` overlays; `ModalComponent` as a separate file | `exists` |
| `ConfirmDialog` | Delete/destructive confirmations only. Uses `Dialog` internally; footer auto `justify-between`. | Inline `window.confirm()`, custom confirm markup | `exists` |
| `Drawer` | Filters, details, quick edit; slide from left/right/bottom | Hand-built slide-in panels | `exists` |
| `Dropdown` (+ `DropdownItem`) | — | — | `exists` |
| `Popover` | — | — | `exists` |
| `Tooltip` | — | — | `exists` |

## Feedback & states
| Canonical | Notes | Do not create | Status |
|---|---|---|---|
| `Toast` (`ToastService` + one `ToastContainer`) | Transient action feedback. Auto-dismiss: success/info **4 s**, warning **6 s**, error **sticky**. Max **4** visible at once. See *Detailed Specs* below. | `SnackbarService`; second toast library; toast markup in a feature | `exists` |
| `NotificationBell` | Icon button in Topbar + unread badge (`99+` cap, hidden at 0) | — | `exists` |
| `NotificationPanel` | Popover (desktop) / Drawer (mobile) listing notification items | — | `exists` |
| `NotificationItem` | Icon by type, title, message, relative time, unread dot, optional link/action | — | `exists` |
| `NotificationService` | State + API access; lives in `core/` or `shared/services/`, not in a UI component | — | `exists` |
| `Alert` / `Banner` | Inline / top-of-layout persistent messages | — | `exists` |
| `Spinner` | For actions/buttons and indeterminate waits | — | `exists` |
| `Progress` | For measurable work (file upload, multi-step); `variant` prop: default/success/warning/danger | — | `exists` |
| **`LoadingShimmer`** | **Required.** `variant`: text, title, avatar, button, card, table-row, table, input, image, custom. All skeleton loading composes this. | `UserLoadingSkeleton`, `TableSkeleton` as standalone copies | `exists` |
| `LoadingOverlay` | Wraps a region while a blocking action runs | — | `exists` |
| `EmptyState` | "Nothing here" illustration + message + optional action | Inline empty markup in pages | `exists` |
| `ErrorState` | Error message + retry output | Inline error markup in pages | `exists` |
| `NoPermission` / `AccessDenied` | — | — | `exists` |
| `NotFound` | 404-style state | — | `exists` |
| `OfflineState` | Network-lost state | — | `exists` |

## Authorization & app-level
| Canonical | Notes | Do not create | Status |
|---|---|---|---|
| `PermissionGate` / directive | Structural show/hide based on permissions; uses the project's permission system | Hard-coded role checks in templates | `?` |
| `RoleGate` | Show/hide based on roles | — | `?` |
| Route guards | Auth + permission guards in `core/guards/` | Guard logic duplicated in components | `?` |
| `ThemeSelector` | 3-mode toggle: **system / light / dark** (uses icons to clearly indicate each mode); reads `prefers-color-scheme`, persists to `localStorage`; applies dark-mode class to `<html>` via `ThemeService`; SSR-safe (no flash on reload) | — | `exists` |
| `LanguageSelector` | Only if i18n is supported | — | `exists` |
| `DensitySelector` | Compact / comfortable / spacious | — | `exists` |
| Auth screens (`Login`, `ForgotPassword`, `ResetPassword`, `VerifyEmail`, `TwoFactor`, `ChangePassword`, `LockScreen`) | Live in `features/auth/`; **presentation only** in shared, logic in services | Auth logic in shared components | `exists` |

## Placement rule of thumb
- Generic, no domain knowledge, used by 2+ features -> `shared/components/<name>`.
- Knows a domain entity (user, ticket, report) -> `features/<feature>/<name>`, built from shared components.

## Dark mode requirement

> **Required for every new page and component.** All colors must use design tokens (CSS variables), never hard-coded hex/rgb. Dark mode is applied by adding `.dark` class to `<html>`. Token values are defined once in the global stylesheet.

Checklist:
```
[ ] Uses only token classes: bg-surface, text-foreground, text-muted, border-border, etc.
[ ] No hard-coded colors (bg-white, text-black, #hex, rgb())
[ ] Dark mode tested visually (check system/light/dark via ThemeSelector)
[ ] Charts use token colors via CSS variables, not static palette arrays
[ ] No flash-of-wrong-theme on page reload (ThemeService applies class before first render)
```

## Updating this catalog
When you add or extend a shared component:
1. Update its **Status** column in the same commit/PR.
2. Remove `?` once the component is confirmed to exist or confirmed not needed (`n/a`).
3. Add a brief note if the component has non-obvious constraints.
4. Update responsive rules table if the component has specific mobile/tablet behavior.

---

# Detailed Specs: Feedback (Toast / Notification) and Icon

Read this part before adding any user feedback message or any icon. All of these are **single systems**: one service/component each, used everywhere. Confirm what already exists in the repo first; extend it rather than replace it.

### Which feedback component to use

| Need | Use | Lifetime | Where it appears |
|---|---|---|---|
| Result of a user action ("Saved", "Delete failed") | **Toast** via `ToastService` | Transient (auto-dismiss) | Screen corner stack |
| Message tied to a form/section/page state | **Alert** | Persistent until state changes | Inline in content |
| System-wide announcement (maintenance, trial ending) | **Banner** | Persistent, dismissible | Top of layout |
| Events for the user over time (new ticket assigned, export ready) | **Notification** (inbox) | Persistent, read/unread | Topbar bell + panel |
| Must confirm a risky action | **ConfirmDialog** | Blocks until answered | Modal |

Do not use a toast for anything the user must read carefully or act on later; that is an Alert or a Notification.

### Toast

**One system:** `ToastService` + a single `ToastContainer` mounted once (in `AdminLayout` or the app root). Pages never render their own `<app-toast>`.

Service API (adapt names to what exists):
```ts
toast.success('User created');
toast.error('Could not save', { description: 'Please try again.' });
toast.warning(...); toast.info(...);
toast.show({ variant, title, description, duration, action: { label: 'Undo', handler } });
toast.dismiss(id); toast.clear();
```

Options:
- `variant`: `success | error | warning | info`
- `title`, `description`
- `duration`: **success/info → 4000 ms · warning → 6000 ms · error → 0 (sticky, manual dismiss)**
- `dismissible` (default `true`)
- `action`: one button (e.g. Undo / Retry)
- `position`: one default (e.g. `top-right`); do not expose as a per-toast option unless required
- `id`: for dedupe/update

Behavior:
- Stack with a **max of 4 visible**; oldest is queued (not dropped silently).
- Pause auto-dismiss on hover/focus.
- Dedupe identical messages fired repeatedly (e.g. failed polling).
- Enter/exit animation respects `prefers-reduced-motion`.
- Accessibility: container is an `aria-live` region; success/info use `polite` + `role="status"`, error uses `assertive` + `role="alert"`. Close button has an accessible label.
- Styling: variant colors come from design tokens (success/warning/danger/info), work in dark mode, layout is responsive (full-width on mobile, safe from the mobile bottom bar).
- HTTP errors: a global interceptor may toast generic failures; feature code toasts only for feature-specific messages. Avoid double toasts.
- Message text goes through i18n if the project has it.

Do not: add another toast/snackbar library, create `SnackbarService` next to `ToastService`, call `alert()`/`window.confirm()`, or build toast markup in a feature.

### Notification (inbox / notification center)

Persistent, per-user notifications. Different from toast: it survives reload and has read state.

Pieces:
```text
NotificationBell        icon button in Topbar + unread badge (uses IconButton, Icon, Badge)
NotificationPanel       Popover (desktop) / Drawer (mobile) listing items
NotificationItem        icon by type, title, message, relative time, unread dot, optional link/action
NotificationService     state + API access (core/ or shared service, not in the UI components)
(optional) notifications page for the full history (DataTable or list + Pagination)
```

`NotificationService` responsibilities: load list (paged), `unreadCount` signal, `markAsRead(id)`, `markAllAsRead()`, `remove(id)`, optionally subscribe to real-time updates (WebSocket/SSE/polling) so UI components stay dumb.

Rules:
- Loading uses `LoadingShimmer` (rows), empty uses `EmptyState` ("You're all caught up"), failure uses `ErrorState` with retry.
- Unread badge shows a **capped number (`99+`)**, hidden at 0; count is announced to screen readers.
- Clicking an item marks it read and navigates via the item's link.
- Types map to icon + color once (info, success, warning, error, plus domain types if needed), like StatusBadge.
- Presentation components (`NotificationItem`, `NotificationPanel`) take data via inputs and emit events; only the service talks to HTTP.
- A new real-time event can *also* raise a toast, but the toast is a separate call. Do not merge the two systems.
- Keyboard: bell opens the panel, Esc closes, items are focusable, focus returns to the bell.

### Icon

**One component:** `<app-icon name="..." />`. All icons in the app go through it.

```html
<app-icon name="user" />                       <!-- decorative: aria-hidden by default -->
<app-icon name="trash" size="sm" class="text-danger" />
<app-icon name="alert-triangle" label="Warning" />   <!-- meaningful: role="img" + aria-label -->
```

API:
- `name`: typed union / registry key (`IconName`), so typos fail at compile time.
- `size`: `xs | sm | md | lg | xl` mapped to token sizing (12 / 16 / 20 / 24 / 32 px); default `md`. Do **not** accept arbitrary pixel values; if a unique size is genuinely required, discuss with the team before adding it.
- `label` (optional): makes the icon meaningful for assistive tech; without it the icon is `aria-hidden="true"`.
- `strokeWidth` (optional, if the library supports it).
- Color: inherits `currentColor`; color it with token text classes (`text-muted`, `text-danger`), never hard-coded hex.

Implementation rules:
- Use the icon library **already in the project** (e.g. Lucide, Heroicons, Material Symbols, Font Awesome). Do not add a second library. If none exists, propose one to the user before adding.
- Register only the icons actually used (tree-shakable registry, e.g. `shared/components/icon/icon-registry.ts`). Add new icons there.
- Custom SVGs go into the same registry as inline SVG using `currentColor` (no fixed fill/stroke colors), so they behave like library icons.
- `IconButton`, `Button` (icon slot), `Input` prefix/suffix, `StatCard`, `Toast`, `Alert`, `Badge`, `Sidebar` items, and `EmptyState` all render icons through `Icon`, not their own `<svg>`.
- Icon-only controls must have an accessible name on the *button* (`IconButton` requires `label`).

Do not: paste raw `<svg>` into feature templates, use emoji or `<img>` for UI icons, mix icon libraries, or create `UserIcon`/`DeleteIcon` components.
