# Admin Portal Design System & Architecture

> **Project:** `admin_portal_angular`
> **Technology Stack:** Angular v22 (Standalone Components, Signals, OnPush), Tailwind CSS v4 (`@theme`), Lucide Angular Icons.
> **Philosophy:** Mobile-first, zero third-party UI framework dependencies, single source of truth for design tokens, full responsive layout (<768px, 768–1023px, ≥1024px).

---

## 1. Design Tokens & Styling (`src/styles.scss`)

Tokens are declared using Tailwind CSS v4 `@theme` directive:

### Color Palette

- **Primary:** `--color-primary: #6366f1` (Indigo-500), `--color-primary-dark: #4f46e5`, `--color-primary-light: #a5b4fc`
- **Secondary:** `--color-secondary: #64748b`, `--color-secondary-dark: #475569`
- **Success:** `--color-success: #22c55e`, `--color-success-dark: #16a34a`
- **Warning:** `--color-warning: #f59e0b`, `--color-warning-dark: #d97706`
- **Danger:** `--color-danger: #ef4444`, `--color-danger-dark: #dc2626`
- **Info:** `--color-info: #3b82f6`, `--color-info-dark: #2563eb`
- **Surfaces & Background:**
  - Background: `--color-background: #f8fafc` (Dark: `#0b0f19`)
  - Surface: `--color-surface: #ffffff` (Dark: `#131b2e`)
  - Surface Raised: `--color-surface-raised: #f1f5f9` (Dark: `#1c2640`)
  - Border: `--color-border: #e2e8f0` (Dark: `#232f4e`)
  - Muted: `--color-muted: #94a3b8`

### Z-Index Scale

- `z-sticky: 20`
- `z-drawer: 30`
- `z-dropdown: 40`
- `z-dialog: 50`
- `z-toast: 60`
- `z-tooltip: 70`

---

## 2. Directory Structure

```text
src/app/
├── core/                        # Global singleton services, state, and guards
│   ├── services/
│   │   ├── toast.service.ts
│   │   ├── notification.service.ts
│   │   └── auth.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── index.ts                 # Core barrel export
├── layout/                      # Application shell & layout components
│   ├── admin-layout/
│   ├── sidebar/
│   ├── topbar/
│   ├── user-menu/
│   ├── footer/
│   ├── page-header/
│   ├── content-container/
│   └── index.ts                 # Layout barrel export
├── shared/                      # Reusable UI component library (76 components)
│   ├── components/
│   │   ├── icon/
│   │   ├── button/
│   │   ├── form-field/
│   │   ├── input/
│   │   ├── dialog/
│   │   ├── data-table/
│   │   ├── charts/
│   │   ├── notification/
│   │   ├── command-palette/
│   │   └── ...
│   ├── directives/
│   │   ├── permission-gate/
│   │   ├── role-gate/
│   │   └── tooltip/
│   └── index.ts                 # Shared barrel export
└── features/                    # Feature modules & pages
    └── auth/                    # Auth presentation screens (Login, ForgotPassword, etc.)
```

---

## 3. Component Inventory & Status Master Checklist

> **AI INSTRUCTION & DEVELOPMENT CONSTRAINTS:**
> All items below are marked `[x] DONE`. They are fully implemented, exported in barrels (`src/app/core`, `src/app/shared`, `src/app/features/auth`, `src/app/layout`), tested with zero build errors (`npx ng build` exit code: 0), and rendered live in `src/app/pages/system-design/system-design.ts`.
> **DO NOT re-create or duplicate any of these components.**

---

### Phase 1 — Foundation (`shared/components/`)

- [x] **1. IconComponent** (`icon/icon.ts`): Registry-backed Lucide icons (`IconName`, sizes `xs`-`xl`).
- [x] **2. ButtonComponent** (`button/button.ts`): Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`, `success`, `warning`, `link`), sizes (`xs`, `sm`, `md`, `lg`), loading spinner.
- [x] **3. IconButtonComponent** (`icon-button/icon-button.ts`): Accessible icon-only button with required label and hover states.
- [x] **4. LoadingShimmerComponent** (`loading-shimmer/loading-shimmer.ts`): Reusable skeleton loader with variants (`text`, `title`, `avatar`, `card`, `table`, `table-row`, `button`, `input`, `image`).
- [x] **5. SpinnerComponent** (`spinner/spinner.ts`): SVG spinner with sizes (`xs`, `sm`, `md`, `lg`, `xl`) and optional text label.
- [x] **6. BadgeComponent** (`badge/badge.ts`): Pill badge with variants (`default`, `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `outline`).
- [x] **7. StatusBadgeComponent** (`status-badge/status-badge.ts`): Semantic status badges backed by `STATUS_MAP` (`active`, `pending`, `inactive`, `archived`, `draft`, `processing`, `completed`, `error`).

---

### Phase 2 — Layout Shell (`layout/`)

- [x] **8. AdminLayoutComponent** (`admin-layout/admin-layout.ts`): Master responsive shell, auto-collapsing sidebar drawer on mobile and full/rail on desktop.
- [x] **9. SidebarComponent** (`sidebar/sidebar.ts`): Collapsible sidebar navigation drawer.
- [x] **10. SidebarItemComponent** (`sidebar/sidebar-item.ts`): Individual navigation item with active indicator and badge.
- [x] **11. SidebarGroupComponent** (`sidebar/sidebar-group.ts`): Collapsible menu sections.
- [x] **12. TopbarComponent** (`topbar/topbar.ts`): Sticky navigation header with mobile trigger, search, notification bell, theme toggle, and user menu.
- [x] **13. UserMenuComponent** (`user-menu/user-menu.ts`): User avatar dropdown menu with profile links and sign-out.
- [x] **14. FooterComponent** (`footer/footer.ts`): Responsive admin footer with versioning and copyright.
- [x] **15. PageHeaderComponent** (`page-header/page-header.ts`): Title, description, breadcrumb slot, and action button bar.

---

### Phase 3 — Form Controls (`shared/components/`)

- [x] **17. FormFieldComponent** (`form-field/form-field.ts`): Label, hint text, error message display, and required asterisk.
- [x] **18. FormControlBase** (`form-control-base/form-control-base.ts`): CVA base class with signal synchronization.
- [x] **19. InputComponent** (`input/input.ts`): Input with prefix/suffix icons, password toggle, and clear button.
- [x] **20. TextareaComponent** (`textarea/textarea.ts`): Multi-line text area with auto-resize and character counter.
- [x] **21. SelectComponent** (`select/select.ts`): Custom searchable select with dropdown positioning.
- [x] **22. CheckboxComponent** (`checkbox/checkbox.ts`): Accessible checkbox supporting indeterminate state and signals.
- [x] **23. RadioComponent** (`radio/radio.ts`): Radio button group with descriptions and keyboard navigation.
- [x] **24. SwitchComponent** (`switch/switch.ts`): Toggle switch with smooth slide animation and signals model.
- [x] **25. SliderComponent** (`slider/slider.ts`): Range input slider with value tooltip and track fill.
- [x] **26. AutocompleteComponent** (`autocomplete/autocomplete.ts`): Typeahead search suggestions with keyboard highlight.
- [x] **27. DatePickerComponent** (`date-picker/date-picker.ts`): Date input with calendar picker and formatted display.
- [x] **28. FileUploadComponent** (`file-upload/file-upload.ts`): Drag-and-drop zone with file type restrictions and preview.

---

### Phase 4 — Overlays & Modals (`shared/components/`)

- [x] **29. DialogComponent** (`dialog/dialog.ts`): Centered modal dialog with backdrop, escape key handler, and size variants (`sm`-`xl`).
- [x] **30. ConfirmDialogComponent** (`confirm-dialog/confirm-dialog.ts`): High-friction confirmation for destructive actions.
- [x] **31. DrawerComponent** (`drawer/drawer.ts`): Slide-over drawer panel from left, right, top, or bottom.
- [x] **32. DropdownComponent** (`dropdown/dropdown.ts`): Positioned dropdown menu with customizable triggers.
- [x] **33. PopoverComponent** (`popover/popover.ts`): Floating rich-content popover with auto-placement.
- [x] **34. TooltipDirective** (`tooltip/tooltip.directive.ts`): Element tooltip hint on hover and focus.
- [x] **35. MenuComponent** (`menu/menu.ts`): Quick 3-dots action menu wrapping Dropdown and IconButton.

---

### Phase 5 — Navigation & Data Display (`shared/components/`)

- [x] **36. BreadcrumbComponent** (`breadcrumb/breadcrumb.ts`): Collapsible breadcrumb path with route integration.
- [x] **37. TabsComponent** (`tabs/tabs.ts`): Horizontal tabbed navigation with mobile scrollbar and badges.
- [x] **38. PaginationComponent** (`pagination/pagination.ts`): Standalone pagination with page numbers, jump to page, and mobile summary.
- [x] **39. StepperComponent** (`stepper/stepper.ts`): Multi-step form wizard progression indicator.
- [x] **40. AvatarComponent** (`avatar/avatar.ts`): User avatar with image and fallback initials.
- [x] **41. AvatarGroupComponent** (`avatar-group/avatar-group.ts`): Stacked avatars with overflow counter (`+3`).
- [x] **42. RoleBadgeComponent** (`role-badge/role-badge.ts`): User authorization role badges (`super-admin`, `admin`, `manager`, `editor`, `user`, `guest`).
- [x] **43. TagComponent** (`tag/tag.ts`): Removable filter tags and badges.
- [x] **44. StatusTagComponent** (`status-tag/status-tag.ts`): Status tag chip with status dot.
- [x] **45. AccordionComponent** (`accordion/accordion.ts`): Collapsible accordion container (single or multi-expand).
- [x] **46. AccordionItemComponent** (`accordion/accordion.ts`): Individual accordion section.
- [x] **47. CardComponent** (`card/card.ts`): Elevated card container.
- [x] **48. CardHeaderComponent** (`card/card.ts`): Card header area.
- [x] **49. CardTitleComponent** (`card/card.ts`): Card title heading.
- [x] **50. CardDescriptionComponent** (`card/card.ts`): Subtitle text.
- [x] **51. CardContentComponent** (`card/card.ts`): Body container.
- [x] **52. CardFooterComponent** (`card/card.ts`): Actions and bottom info bar.
- [x] **53. StatCardComponent** (`stat-card/stat-card.ts`): KPI metric card with trend percentage indicator (+12%, -5%) and icon.
- [x] **54. DataTableComponent** (`data-table/data-table.ts`): Sortable, selectable table supporting:
  - **Table with Pagination**: `[total]="100" [pageSize]="5" [currentPage]="page" (pageChange)="onPage($event)"`
  - **Table without Pagination**: `[paginated]="false"` or omitting `total`
  - **Table with Loading Shimmer**: `[loading]="true" [loadingRows]="5"`
  - **Selectable Rows**: `[selectable]="true" (selectionChange)="onSelect($event)"`
  - **Row Actions**: `[showActions]="true"` with action slot
- [x] **55. ProgressComponent** (`progress/progress.ts`): Linear and circular progress indicators (`default`, `success`, `warning`, `danger`, `info`).

---

### Phase 6 — Feedback & States (`shared/components/`)

- [x] **56. ToastService** (`core/services/toast.service.ts`): Signal-driven notifications with success, error, warning, and info.
- [x] **57. ToastContainerComponent** (`shared/components/toast/toast-container.ts`): Viewport stack for animated toasts.
- [x] **58. AlertComponent** (`alert/alert.ts`): Inline message banners with 4 semantic variants.
- [x] **59. LoadingOverlayComponent** (`loading-overlay/loading-overlay.ts`): Container or fullscreen loading blocker with backdrop blur.
- [x] **60. EmptyStateComponent** (`empty-state/empty-state.ts`): Placeholder for empty lists with action button.
- [x] **61. ErrorStateComponent** (`error-state/error-state.ts`): Error screen with error code and Retry action.
- [x] **62. NoPermissionComponent** (`no-permission/no-permission.ts`): 403 Forbidden screen with role/permission requirements.
- [x] **63. NotFoundComponent** (`not-found/not-found.ts`): 404 Not Found screen with return home button.
- [x] **64. OfflineStateComponent** (`offline-state/offline-state.ts`): Network connectivity banner and offline state screen.

---

### Phase 7 — Notification System (`shared/components/notification/`)

- [x] **65. NotificationService** (`core/services/notification.service.ts`): Reactive notification store with unread counter.
- [x] **66. NotificationBellComponent** (`notification/notification-bell/notification-bell.ts`): Topbar bell with unread badge and toggle panel.
- [x] **67. NotificationPanelComponent** (`notification/notification-panel/notification-panel.ts`): Notification dropdown feed with mark-all-read.
- [x] **68. NotificationItemComponent** (`notification/notification-panel/notification-panel.ts`): Individual notification entry with timestamp.

---

### Phase 8 — Authorization & Theming (`shared/` & `core/`)

- [x] **69. PermissionGateDirective** (`directives/permission-gate/permission-gate.directive.ts`): Structural directive `*appPermissionGate="'users:write'"`.
- [x] **70. RoleGateDirective** (`directives/role-gate/role-gate.directive.ts`): Structural directive `*appRoleGate="'admin'"`.
- [x] **71. ThemeSelectorComponent** (`theme-selector/theme-selector.ts`): Light / Dark / System theme switcher.
- [x] **72. LanguageSelectorComponent** (`language-selector/language-selector.ts`): International locale selector.
- [x] **73. DensitySelectorComponent** (`density-selector/density-selector.ts`): Spacing density selector (`compact`, `comfortable`, `spacious`).

---

### Phase 9 — Authentication Screens (`features/auth/`)

- [x] **74. AuthCardComponent** (`auth-card.ts`): Centered card container for auth workflows.
- [x] **75. LoginComponent** (`login/login.ts`): Sign-in form with email, password, and remember-me.
- [x] **76. ForgotPasswordComponent** (`forgot-password/forgot-password.ts`): Password reset request screen.
- [x] **77. ResetPasswordComponent** (`reset-password/reset-password.ts`): New password form with strength verification.
- [x] **78. VerifyEmailComponent** (`verify-email/verify-email.ts`): Email verification screen with resend timer.
- [x] **79. TwoFactorComponent** (`two-factor/two-factor.ts`): 6-digit 2FA authenticator verification.
- [x] **80. ChangePasswordComponent** (`change-password/change-password.ts`): In-app password update form.
- [x] **81. LockScreenComponent** (`lock-screen/lock-screen.ts`): Screen lock with avatar and quick PIN/password unlock.

---

### Phase 10 — SVG Charts (`shared/components/charts/`)

- [x] **82. LineChartComponent** (`charts/line-chart.ts`): Vector line chart with gradient and hover tooltip.
- [x] **83. BarChartComponent** (`charts/bar-chart.ts`): Vertical bar chart with value hover.
- [x] **84. AreaChartComponent** (`charts/area-chart.ts`): Smooth area chart with gradient fill.
- [x] **85. PieChartComponent** (`charts/pie-chart.ts`): Donut/Pie chart with legend and percentages.
- [x] **86. ChartCardComponent** (`charts/chart-card.ts`): Card wrapper with chart title and action slot.

---

### Phase 11 — Advanced Navigation (`shared/components/command-palette/`)

- [x] **87. CommandPaletteComponent** (`command-palette/command-palette.ts`): Spotlight search modal triggered with `Cmd+K` / `Ctrl+K`.

---

### Phase 13 — Advanced Layout & Hierarchical Data (`shared/components/`)

- [x] **88. GridComponent & GridColComponent** (`grid/grid.ts`): Enterprise responsive 12-column grid layout with breakpoint col-spans (`spanSm`, `spanMd`, `spanLg`, `spanXl`) and fluid `autoFit` mode.
- [x] **89. TreeViewComponent** (`tree-view/tree-view.ts`): Hierarchical tree navigation with recursive expandable nodes and cascading 3-state checkbox support (checked, unchecked, indeterminate), search filter, custom icons, and badges.
- [x] **90. ButtonGroupComponent** (`button-group/button-group.ts`): Connected action toolbars and data-driven segmented controls with horizontal/vertical orientations, attached borders, and single/multiple selection mode.

---

### Phase 14 — Auth Screens Version 2 (Centered Card + Dark/Light Ambient Background, No Image)

- [x] **91. AuthV2LayoutComponent** (`features/auth-v2/auth-v2-layout.ts`): Centered card container (max-w-md), pure CSS ambient dark/light glow background (zero bitmap images), top-right language & theme switcher.
- [x] **92. LoginV2Component** (`features/auth-v2/login/login.ts`): Route `/auth-v2/login` — Centered sign in with remember-me, forgot password, social dividers.
- [x] **93. ForgotPasswordV2Component** (`features/auth-v2/forgot-password/forgot-password.ts`): Route `/auth-v2/forgot-password` — Centered password reset request.
- [x] **94. ResetPasswordV2Component** (`features/auth-v2/reset-password/reset-password.ts`): Route `/auth-v2/reset-password` — Centered new password setting with live strength meter.
- [x] **95. VerifyEmailV2Component** (`features/auth-v2/verify-email/verify-email.ts`): Route `/auth-v2/verify-email` — Centered 6-digit OTP verification with 60s countdown resend.
- [x] **96. TwoFactorV2Component** (`features/auth-v2/two-factor/two-factor.ts`): Route `/auth-v2/two-factor` — Centered 2FA verification with TOTP OTP, QR Code pairing, and backup codes.
- [x] **97. ChangePasswordV2Component** (`features/auth-v2/change-password/change-password.ts`): Route `/auth-v2/change-password` — Centered password change with session invalidation toggle.
- [x] **98. LockScreenV2Component** (`features/auth-v2/lock-screen/lock-screen.ts`): Route `/auth-v2/lock-screen` — Centered lock card with user avatar and password unlock.

---

## 4. Specific Patterns & Component Variations

### Data Table Variations

1. **With Pagination**:
   ```html
   <app-data-table
     [columns]="columns"
     [data]="currentPageRows"
     [total]="100"
     [pageSize]="10"
     [currentPage]="currentPage"
     (pageChange)="onPageChange($event)"
   />
   ```
2. **Without Pagination (Compact / Embedded)**:
   ```html
   <app-data-table [columns]="columns" [data]="allRows" [paginated]="false" />
   ```
3. **With Loading Shimmer (Skeleton State)**:
   ```html
   <app-data-table [columns]="columns" [data]="[]" [loading]="true" [loadingRows]="5" />
   ```
4. **Standalone Pagination**:
   ```html
   <app-pagination
     [total]="250"
     [pageSize]="10"
     [(currentPage)]="currentPage"
     (pageChange)="loadData($event)"
   />
   ```

### Loading Shimmer Variants

- `variant="text"`: Paragraph skeleton with `[lines]="3"`.
- `variant="avatar"`: Circular skeleton for profile images.
- `variant="card"`: Elevated card skeleton.
- `variant="table"`: Full tabular skeleton preview.
- `variant="title"` / `variant="button"` / `variant="input"`.

---

## 5. Live Showcase Route

The complete interactive catalog demonstrating all components above is live at:

- Route: `/system-design` or `/`
- File: `src/app/pages/system-design/system-design.ts`
