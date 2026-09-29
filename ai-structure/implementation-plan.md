# Implementation Plan — Admin Portal Angular

> **Cách dùng file này:**
> - AI đọc file này **trước** khi implement bất kỳ component nào.
> - Sau khi implement xong, AI cập nhật Status trong file này **và** trong `component-catalog.md` cùng 1 lúc.
> - Status values: `planned` → `in-progress` → `done` → `n/a`

---

## Legend
| Symbol | Nghĩa |
|---|---|
| `planned` | Chưa làm |
| `in-progress` | Đang làm (ghi tên AI/người đang làm) |
| `done` | Đã xong, build pass |
| `n/a` | Project không cần |

---

## Phase 1 — Foundation (phải xong trước mọi thứ khác)

> Các component này là nền tảng. Component khác phụ thuộc vào chúng.

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 1 | `Icon` + icon registry | `shared/components/icon/` | `done` | 2026-09-28 |
| 2 | `Button` | `shared/components/button/` | `done` | 2026-09-28 |
| 3 | `IconButton` | `shared/components/icon-button/` | `done` | 2026-09-28 |
| 4 | `LoadingShimmer` | `shared/components/loading-shimmer/` | `done` | 2026-09-28 |
| 5 | `Spinner` | `shared/components/spinner/` | `done` | 2026-09-28 |
| 6 | `Badge` | `shared/components/badge/` | `done` | 2026-09-28 |
| 7 | `StatusBadge` | `shared/components/status-badge/` | `done` | 2026-09-28 |

---

## Phase 2 — Layout shell (cần Phase 1 xong)

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 8 | `AdminLayout` | `layout/admin-layout/` | `done` | 2026-09-28 |
| 9 | `Sidebar` (+ `SidebarItem`, `SidebarGroup`) | `layout/sidebar/` | `done` | 2026-09-28 |
| 10 | `Topbar` | `layout/topbar/` | `done` | 2026-09-28 |
| 11 | `UserMenu` | `layout/user-menu/` | `done` | 2026-09-28 |
| 12 | `Footer` | `layout/footer/` | `done` | 2026-09-28 |
| 13 | `PageHeader` | `layout/page-header/` | `done` | 2026-09-28 |
| 14 | `ContentContainer` | `layout/content-container/` | `done` | 2026-09-28 |

---

## Phase 3 — Forms (cần Phase 1 xong)

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 15 | `FormField` | `shared/components/form-field/` | `done` | 2026-09-28 |
| 16 | `Input` | `shared/components/input/` | `done` | 2026-09-28 |
| 17 | `Textarea` | `shared/components/textarea/` | `done` | 2026-09-28 |
| 18 | `Select` | `shared/components/select/` | `done` | 2026-09-28 |
| 19 | `Checkbox` | `shared/components/checkbox/` | `done` | 2026-09-28 |
| 20 | `Radio` | `shared/components/radio/` | `done` | 2026-09-28 |
| 21 | `Switch` | `shared/components/switch/` | `done` | 2026-09-28 |
| 22 | `Slider` | `shared/components/slider/` | `done` | 2026-09-28 |
| 23 | `Autocomplete` | `shared/components/autocomplete/` | `done` | 2026-09-28 |
| 24 | `DatePicker` | `shared/components/date-picker/` | `done` | 2026-09-28 |
| 25 | `FileUpload` | `shared/components/file-upload/` | `done` | 2026-09-28 |

---

## Phase 4 — Overlays (cần Phase 1 + 2 xong)

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 26 | `Dialog` | `shared/components/dialog/` | `done` | 2026-09-28 |
| 27 | `ConfirmDialog` | `shared/components/confirm-dialog/` | `done` | 2026-09-28 |
| 28 | `Drawer` | `shared/components/drawer/` | `done` | 2026-09-28 |
| 29 | `Dropdown` (+ `DropdownItem`) | `shared/components/dropdown/` | `done` | 2026-09-28 |
| 30 | `Popover` | `shared/components/popover/` | `done` | 2026-09-28 |
| 31 | `Tooltip` | `shared/components/tooltip/` | `done` | 2026-09-28 |
| 32 | `Menu` | `shared/components/menu/` | `done` | 2026-09-28 |

---

## Phase 5 — Navigation & Data display (cần Phase 1–4 xong)

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 33 | `Breadcrumb` | `shared/components/breadcrumb/` | `done` | 2026-09-28 |
| 34 | `Tabs` (+ `Tab`, `TabPanel`) | `shared/components/tabs/` | `done` | 2026-09-28 |
| 35 | `Pagination` | `shared/components/pagination/` | `done` | 2026-09-28 |
| 36 | `Stepper` | `shared/components/stepper/` | `done` | 2026-09-28 |
| 37 | `Avatar` (+ `AvatarGroup`) | `shared/components/avatar/` | `done` | 2026-09-28 |
| 38 | `RoleBadge` | `shared/components/role-badge/` | `done` | 2026-09-28 |
| 39 | `Tag` / `Chip` | `shared/components/tag/` | `done` | 2026-09-28 |
| 40 | `StatusTag` | `shared/components/status-tag/` | `done` | 2026-09-28 |
| 41 | `Accordion` | `shared/components/accordion/` | `done` | 2026-09-28 |
| 42 | `Card` (+ sub-parts) | `shared/components/card/` | `done` | 2026-09-28 |
| 43 | `StatCard` | `shared/components/stat-card/` | `done` | 2026-09-28 |
| 44 | `DataTable` | `shared/components/data-table/` | `done` | 2026-09-28 |
| 45 | `Progress` | `shared/components/progress/` | `done` | 2026-09-28 |

---

## Phase 6 — Feedback & States (cần Phase 1–5 xong)

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 46 | `Toast` + `ToastService` + `ToastContainer` | `shared/components/toast/` + `core/services/` | `done` | 2026-09-28 |
| 47 | `Alert` / `Banner` | `shared/components/alert/` | `done` | 2026-09-28 |
| 48 | `LoadingOverlay` | `shared/components/loading-overlay/` | `done` | 2026-09-28 |
| 49 | `EmptyState` | `shared/components/empty-state/` | `done` | 2026-09-28 |
| 50 | `ErrorState` | `shared/components/error-state/` | `done` | 2026-09-28 |
| 51 | `NoPermission` / `AccessDenied` | `shared/components/no-permission/` | `done` | 2026-09-28 |
| 52 | `NotFound` | `shared/components/not-found/` | `done` | 2026-09-28 |
| 53 | `OfflineState` | `shared/components/offline-state/` | `done` | 2026-09-28 |

---

## Phase 7 — Notification system (cần Phase 1–6 xong)

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 54 | `NotificationService` | `core/services/notification.service.ts` | `done` | 2026-09-28 |
| 55 | `NotificationBell` | `shared/components/notification/notification-bell/` | `done` | 2026-09-28 |
| 56 | `NotificationPanel` | `shared/components/notification/notification-panel/` | `done` | 2026-09-28 |
| 57 | `NotificationItem` | `shared/components/notification/notification-item/` | `done` | 2026-09-28 |

---

## Phase 8 — Authorization & Theming (cần Phase 1–6 xong)

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 58 | `PermissionGate` / directive | `shared/directives/permission-gate/` | `done` | 2026-09-28 |
| 59 | `RoleGate` | `shared/directives/role-gate/` | `done` | 2026-09-28 |
| 60 | Route guards | `core/guards/` | `done` | 2026-09-28 |
| 61 | `ThemeSelector` | `shared/components/theme-selector/` | `done` | 2026-09-28 |
| 62 | `LanguageSelector` | `shared/components/language-selector/` | `done` | 2026-09-28 |
| 63 | `DensitySelector` | `shared/components/density-selector/` | `done` | 2026-09-28 |

---

## Phase 9 — Auth screens (features/auth)

> ⚠️ **Phase 9 screens đã `done` nhưng cần REDESIGN theo Phase 12 bên dưới.**
> - Layout cũ dùng `AuthCardComponent` (centered card) → thay bằng **split-screen layout** (50% hero image | 50% form).
> - `AuthCardComponent` (`auth-card.ts`) sẽ bị thay bằng `AuthLayoutComponent` mới.
> - Các screens dùng Tailwind raw color cần migrate sang design tokens.

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 64 | `Login` | `features/auth/login/` | `redesign-needed` | 2026-09-28 |
| 65 | `ForgotPassword` | `features/auth/forgot-password/` | `redesign-needed` | 2026-09-28 |
| 66 | `ResetPassword` | `features/auth/reset-password/` | `redesign-needed` | 2026-09-28 |
| 67 | `VerifyEmail` | `features/auth/verify-email/` | `redesign-needed` | 2026-09-28 |
| 68 | `TwoFactor` | `features/auth/two-factor/` | `redesign-needed` | 2026-09-28 |
| 69 | `ChangePassword` | `features/auth/change-password/` | `redesign-needed` | 2026-09-28 |
| 70 | `LockScreen` | `features/auth/lock-screen/` | `redesign-needed` | 2026-09-28 |

---

## Phase 10 — Charts (chỉ khi dashboard cần)

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 71 | `LineChart` | `shared/components/charts/line-chart/` | `done` | 2026-09-28 |
| 72 | `BarChart` | `shared/components/charts/bar-chart/` | `done` | 2026-09-28 |
| 73 | `AreaChart` | `shared/components/charts/area-chart/` | `done` | 2026-09-28 |
| 74 | `PieChart` / `DonutChart` | `shared/components/charts/pie-chart/` | `done` | 2026-09-28 |
| 75 | `ChartCard` | `shared/components/charts/chart-card/` | `done` | 2026-09-28 |

---

## Phase 11 — Advanced navigation (optional)

| # | Component | File path | Status | Done at |
|---|---|---|---|---|
| 76 | `CommandPalette` / `GlobalSearch` | `shared/components/command-palette/` | `done` | 2026-09-28 |

---

## Phase 12 — Auth screens REDESIGN (cần Phase 9 screens đã tồn tại)

> **Mục tiêu:** Nâng cấp toàn bộ auth screens từ centered-card lên premium split-screen layout.
> Không hiển thị trong `system-design` showcase — mỗi screen là 1 route độc lập.

### 12.0 — Shared auth infrastructure (làm TRƯỚC các screens)

| # | Task | File path | Status | Done at |
|---|---|---|---|---|
| 77 | Xóa `AuthCardComponent` cũ (`auth-card.ts`) | `features/auth/auth-card.ts` | `done` | 2026-09-29 |
| 78 | Tạo `AuthLayoutComponent` — split-screen 50/50 (hero image left \| form right); responsive: ảnh ẩn trên mobile, form full-width | `features/auth/auth-layout.ts` | `done` | 2026-09-29 |
| 79 | Tạo `OtpInputComponent` — 6 ô số tách biệt; auto-focus next; paste support; backspace xóa & focus prev; emit complete khi điền đủ | `shared/components/otp-input/` | `done` | 2026-09-29 |
| 80 | Tạo `QrCodeComponent` — hiển thị QR code SVG/img; fallback text "Scan with your authenticator" | `shared/components/qr-code/` | `done` | 2026-09-29 |
| 81 | Migrate Tailwind raw colors → design tokens trong tất cả auth screens | tất cả `features/auth/` | `done` | 2026-09-29 |

### 12.1 — Login

| # | Screen | Layout | Key elements | Status | Done at |
|---|---|---|---|---|---|
| 82 | `Login` | Split-screen | **Left:** hero image + branding overlay + tagline. **Right:** logo, "Welcome back" title, email input, password input (show/hide toggle), "Remember me" checkbox, "Forgot password?" link, Sign in button (full-width), social divider + Google/GitHub buttons (optional), "Don't have account?" link | `done` | 2026-09-29 |

### 12.2 — ForgotPassword

| # | Screen | Layout | Key elements | Status | Done at |
|---|---|---|---|---|---|
| 83 | `ForgotPassword` | Split-screen | **Left:** same hero image. **Right:** back arrow, email icon, "Reset password" title, description text, email input, "Send reset link" button, success state (check icon + "Check your email" message + resend countdown), back to login link | `done` | 2026-09-29 |

### 12.3 — ResetPassword

| # | Screen | Layout | Key elements | Status | Done at |
|---|---|---|---|---|---|
| 84 | `ResetPassword` | Split-screen | **Left:** same hero image. **Right:** lock icon, "New password" title, new password input + strength meter, confirm password input, "Reset password" button, success redirect after 3s | `done` | 2026-09-29 |

### 12.4 — VerifyEmail / OTP

| # | Screen | Layout | Key elements | Status | Done at |
|---|---|---|---|---|---|
| 85 | `VerifyEmail` | Split-screen | **Left:** same hero image. **Right:** email icon, "Check your email" title, description with masked email, **OTP input (6 ô số — dùng `OtpInputComponent`)**, "Verify" button (disabled until 6 digits), "Resend code" với countdown 60s (disable button, show timer, re-enable khi hết giờ), back to login link | `done` | 2026-09-29 |

### 12.5 — TwoFactor (2FA)

> **2 mode**, switch bằng tab/toggle:

| # | Screen | Mode | Key elements | Status | Done at |
|---|---|---|---|---|---|
| 86 | `TwoFactor` — TOTP | Tab: "Authenticator app" | **OTP input (6 ô số — `OtpInputComponent`)**, "Verify" button, "Use backup code" link, back to login | `done` | 2026-09-29 |
| 87 | `TwoFactor` — QR Setup | Tab: "Setup (first time)" | **`QrCodeComponent`** hiển thị QR, manual entry key (copyable), sau khi scan xong → **OTP input 6 số để confirm**, "Enable 2FA" button | `done` | 2026-09-29 |

### 12.6 — ChangePassword

| # | Screen | Layout | Key elements | Status | Done at |
|---|---|---|---|---|---|
| 88 | `ChangePassword` | Split-screen | **Left:** same hero image. **Right:** current password input, new password input + strength meter (weak/fair/strong/very strong indicator bar), confirm new password, "Change password" button, logout all devices checkbox | `done` | 2026-09-29 |

### 12.7 — LockScreen

| # | Screen | Layout | Key elements | Status | Done at |
|---|---|---|---|---|---|
| 89 | `LockScreen` | **Full-screen** (không dùng split) | Blurred background overlay, user avatar + name centered, password input, "Unlock" button, "Sign in as different user" link | `done` | 2026-09-29 |

---

### Phase 12 — Design specs chung

#### AuthLayoutComponent — split-screen template
```
┌─────────────────────────────────────────────────────────────┐
│  [LEFT 50%]                │  [RIGHT 50%]                   │
│  Hero image (object-cover) │  Scrollable form area          │
│  + dark overlay gradient   │  max-w-sm mx-auto px-8 py-12   │
│  + logo + tagline          │  Logo mark (small)             │
│                            │  Title (h1)                    │
│                            │  Subtitle / description        │
│                            │  Form content (ng-content)     │
│                            │  Footer links                  │
│  HIDDEN on mobile (<lg)    │  Full-width on mobile          │
└─────────────────────────────────────────────────────────────┘
```

#### OtpInputComponent API
```ts
// Inputs
length = input(6);          // số ô (default: 6)
type = input<'number' | 'alphanumeric'>('number');
disabled = input(false);
placeholder = input('·');

// Outputs
completed = output<string>();  // emit khi điền đủ tất cả ô
valueChange = output<string>(); // emit mỗi khi giá trị thay đổi
```

#### QrCodeComponent API
```ts
// Inputs
value = input.required<string>();  // URI otpauth:// hoặc URL
size = input(200);                 // px
label = input('Scan with your authenticator app');
showManualKey = input(true);
manualKey = input<string | undefined>(undefined);
```

#### Design tokens — không dùng Tailwind raw colors
```
❌ bg-white, text-gray-900, bg-gray-50
✅ bg-surface, text-foreground, bg-surface-raised

❌ bg-blue-600, hover:bg-blue-700
✅ bg-primary, hover:bg-primary-dark

❌ text-red-500, border-red-300
✅ text-danger, border-danger/50
```

#### Password strength meter
```
Weak       → bg-danger   (1/4 filled)
Fair       → bg-warning  (2/4 filled)
Strong     → bg-success  (3/4 filled)
Very Strong → bg-success (4/4 filled, brighter)
```

#### Resend OTP countdown
```
- Default: disabled, showing "Resend in 60s"
- Countdown every second
- Re-enable button at 0s, label → "Resend code"
- Click → restart 60s timer + call API
```

---

## How AI should use this file

1. **Trước khi implement:** Đọc file này, kiểm tra Status. Nếu `in-progress` → báo cho user trước khi tiếp tục.
2. **Khi bắt đầu:** Đổi Status → `in-progress (AI)`.
3. **Sau khi implement xong & build pass:** Đổi Status → `done` + ghi ngày vào cột `Done at`.
4. **Cùng lúc:** Cập nhật cột Status trong `component-catalog.md` từ `planned` → `exists`.
5. **Nếu không cần:** Đổi → `n/a` + ghi lý do ngắn.
6. **Auth redesign:** Phase 12 screens KHÔNG được thêm vào `system-design.ts` showcase — chúng là standalone routes.

> **Dependency rule:** Không implement component có dependency chưa `done`.
>
> ```
> Phase 1 (Icon, Button, Badge, LoadingShimmer, Spinner, StatusBadge)
>   -> Phase 2 (Layout) + Phase 3 (Forms)
>   -> Phase 4 (Overlays) [cần cả Phase 2]
>        -> Phase 5 (Nav + Data display)
>             -> Phase 6 (Feedback & States)
>                  -> Phase 7 (Notification)
>                  -> Phase 8 (Auth & Theming)
> Phase 9 (Auth screens) — cần Phase 1–6
> Phase 10 (Charts)      — cần Phase 5
> Phase 11 (CommandPalette) — cần Phase 4
> Phase 12 (Auth Redesign) — cần Phase 9 + OtpInput + QrCode (items 77–81 trước)
> ```

