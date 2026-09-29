import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Core
import { ToastService, NotificationService, AuthService, TranslationService } from '../../core';

// Layout
import {
  HeaderComponent,
  SidebarComponent,
  FooterComponent,
  UserMenuComponent,
  type SidebarNavSection,
} from '../../layout';

// Shared Components Barrel
import {
  ButtonComponent,
  IconButtonComponent,
  BadgeComponent,
  StatusBadgeComponent,
  RoleBadgeComponent,
  TagComponent,
  StatusTagComponent,
  LoadingShimmerComponent,
  SpinnerComponent,
  FormFieldComponent,
  InputComponent,
  TextareaComponent,
  SelectComponent,
  type SelectOption,
  MultiSelectComponent,
  CheckboxComponent,
  RadioComponent,
  SwitchComponent,
  SliderComponent,
  AutocompleteComponent,
  DatePickerComponent,
  DateRangePickerComponent,
  QuickFiltersComponent,
  type QuickFilterOption,
  FileUploadComponent,
  DialogComponent,
  ConfirmDialogComponent,
  DrawerComponent,
  DropdownComponent,
  DropdownItem,
  PopoverComponent,
  TooltipDirective,
  MenuComponent,
  BreadcrumbComponent,
  BreadcrumbItem,
  TabsComponent,
  TabItem,
  PaginationComponent,
  StepperComponent,
  AvatarComponent,
  AvatarGroupComponent,
  AccordionComponent,
  AccordionItemComponent,
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  CardFooterComponent,
  StatCardComponent,
  ProgressComponent,
  DataTableComponent,
  TableColumn,
  ToastContainerComponent,
  AlertComponent,
  LoadingOverlayComponent,
  EmptyStateComponent,
  ErrorStateComponent,
  NoPermissionComponent,
  NotFoundComponent,
  OfflineStateComponent,
  LineChartComponent,
  BarChartComponent,
  AreaChartComponent,
  PieChartComponent,
  ChartCardComponent,
  ChartDataPoint,
  CommandPaletteComponent,
  PermissionGateDirective,
  RoleGateDirective,
} from '../../shared';

@Component({
  selector: 'app-system-design',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconButtonComponent,
    BadgeComponent,
    StatusBadgeComponent,
    RoleBadgeComponent,
    TagComponent,
    StatusTagComponent,
    LoadingShimmerComponent,
    SpinnerComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    SelectComponent,
    MultiSelectComponent,
    CheckboxComponent,
    RadioComponent,
    SwitchComponent,
    SliderComponent,
    AutocompleteComponent,
    DatePickerComponent,
    FileUploadComponent,
    DialogComponent,
    ConfirmDialogComponent,
    DrawerComponent,
    DropdownComponent,
    PopoverComponent,
    TooltipDirective,
    MenuComponent,
    BreadcrumbComponent,
    TabsComponent,
    PaginationComponent,
    StepperComponent,
    AvatarComponent,
    AvatarGroupComponent,
    AccordionComponent,
    AccordionItemComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    StatCardComponent,
    ProgressComponent,
    DataTableComponent,
    ToastContainerComponent,
    AlertComponent,
    LoadingOverlayComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    NoPermissionComponent,
    NotFoundComponent,
    OfflineStateComponent,
    LineChartComponent,
    BarChartComponent,
    AreaChartComponent,
    PieChartComponent,
    ChartCardComponent,
    CommandPaletteComponent,
    PermissionGateDirective,
    RoleGateDirective,
    UserMenuComponent,
    DateRangePickerComponent,
    QuickFiltersComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  templateUrl: './system-design.html',
})
export class SystemDesignComponent {
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly translation = inject(TranslationService);

  // States
  protected mobileSidebarOpen = signal(false);
  protected desktopSidebarCollapsed = signal(false);
  protected commandPaletteOpen = signal(false);
  protected sampleDialogOpen = signal(false);
  protected sampleConfirmOpen = signal(false);
  protected sampleDrawerOpen = signal(false);
  protected isTableLoading = signal(false);
  protected isOverlayActive = signal(false);

  protected toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.mobileSidebarOpen.update((open) => !open);
    } else {
      this.desktopSidebarCollapsed.update((collapsed) => !collapsed);
    }
  }

  // Navigation & Shell
  protected activeTabId = signal('overview');
  protected sampleBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Portal', link: '/' },
    { label: 'E-Commerce', link: '/system-design' },
    { label: 'Orders' },
  ];
  protected sampleTabs: TabItem[] = [
    { id: 'overview', label: 'Overview', badge: '12' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'security', label: 'Security' },
    { id: 'audit-logs', label: 'Audit Logs' },
  ];
  protected sampleUserMenuData = {
    name: 'Sarah Connor',
    email: 'sarah@cyberdyne.com',
  };

  // Navigation sections
  protected readonly navigationSections = computed<SidebarNavSection[]>(() => [
    {
      id: 'dashboard',
      title: this.translation.t('nav.dashboard'),
      icon: 'layout-dashboard',
      badge: 'Live',
      routerLink: '/system-design',
      subItems: [
        { label: this.translation.t('nav.platformAnalytics'), id: 'section-7' },
        { label: this.translation.t('nav.activityLogs'), id: 'section-4' },
      ],
    },
    {
      id: 'system-design',
      title: this.translation.t('nav.systemDesign'),
      icon: 'grid',
      badge: this.translation.t('nav.itemsReady'),
      routerLink: '/system-design',
      subItems: [
        { label: this.translation.t('section.foundation'), id: 'section-1' },
        { label: this.translation.t('section.formControls'), id: 'section-2' },
        { label: this.translation.t('section.navigation'), id: 'section-3' },
        { label: this.translation.t('section.dataTables'), id: 'section-4' },
        { label: this.translation.t('section.skeletons'), id: 'section-5' },
        { label: this.translation.t('section.kpis'), id: 'section-6' },
        { label: this.translation.t('section.charts'), id: 'section-7' },
        { label: this.translation.t('section.overlays'), id: 'section-8' },
        { label: this.translation.t('section.feedback'), id: 'section-9' },
        { label: this.translation.t('section.authorization'), id: 'section-10' },
      ],
    },
    {
      id: 'authentication',
      title: this.translation.t('nav.authentication'),
      icon: 'shield',
      badge: this.translation.t('nav.screens'),
      routerLink: '/auth/login',
      subItems: [
        { label: this.translation.t('auth.signIn'), id: 'auth-login', routerLink: '/auth/login' },
        { label: this.translation.t('auth.forgotPassword'), id: 'auth-forgot', routerLink: '/auth/forgot-password' },
        { label: this.translation.t('auth.verifyOtp'), id: 'auth-otp', routerLink: '/auth/verify-otp' },
        { label: this.translation.t('auth.resetPassword'), id: 'auth-reset', routerLink: '/auth/reset-password' },
        { label: this.translation.t('auth.twoFactor'), id: 'auth-2fa', routerLink: '/auth/two-factor' },
        { label: this.translation.t('auth.lockScreen'), id: 'auth-lock', routerLink: '/auth/lock-screen' },
        { label: this.translation.t('auth.changePassword'), id: 'auth-change', routerLink: '/auth/change-password' },
      ],
    },
    {
      id: 'users',
      title: this.translation.t('nav.userManagement'),
      icon: 'users',
      badge: this.translation.t('common.admin'),
      routerLink: '/system-design',
      subItems: [
        { label: this.translation.t('nav.teamDirectory'), id: 'section-4' },
        { label: this.translation.t('nav.rolePermissions'), id: 'section-10' },
      ],
    },
    {
      id: 'settings',
      title: this.translation.t('nav.settings'),
      icon: 'settings',
      badge: 'v1.0',
      routerLink: '/system-design',
      subItems: [
        { label: this.translation.t('nav.workspacePreferences'), id: 'section-3' },
        { label: this.translation.t('nav.environmentConfig'), id: 'section-8' },
      ],
    },
  ]);

  // Search Select & Multi-Select demo states
  protected sampleFrameworkOptions: SelectOption[] = [
    { value: 'angular', label: 'Angular 22 (Signals)' },
    { value: 'react', label: 'React 19' },
    { value: 'vue', label: 'Vue 3.5' },
    { value: 'svelte', label: 'Svelte 5' },
    { value: 'nextjs', label: 'Next.js 15' },
    { value: 'nuxt', label: 'Nuxt 3' },
  ];
  protected selectedFramework = signal('angular');

  protected sampleTechnologyOptions: SelectOption[] = [
    { value: 'angular', label: 'Angular 22 (Signals)', badge: 'Core', icon: 'check-circle' },
    { value: 'typescript', label: 'TypeScript 5.8', badge: 'Lang', icon: 'file-text' },
    { value: 'tailwind', label: 'Tailwind CSS 4', badge: 'Style', icon: 'layout-dashboard' },
    { value: 'rxjs', label: 'RxJS Interop', badge: 'Async', icon: 'clock' },
    { value: 'lucide', label: 'Lucide Angular Icons', badge: 'Icons', icon: 'check' },
    { value: 'vite', label: 'Vite / ESBuild', badge: 'Tool', icon: 'loader' },
    { value: 'postcss', label: 'PostCSS', badge: 'Build', icon: 'shield' },
  ];
  protected selectedTechnologies = signal<string[]>(['angular', 'typescript', 'tailwind']);

  // Dedicated Date Range states
  protected sampleRangeStart = signal('2026-09-01');
  protected sampleRangeEnd = signal('2026-09-30');

  // Multi-select Quick Filter chips
  protected sampleFilterChips: QuickFilterOption[] = [
    { id: 'active', label: 'Active Status', count: 42, icon: 'check-circle' },
    { id: 'pending', label: 'Pending Approval', count: 8, icon: 'clock' },
    { id: 'admin', label: 'Administrators', count: 5, icon: 'shield' },
    { id: 'verified', label: 'Verified Email', count: 35, icon: 'check' },
    { id: 'suspended', label: 'Suspended', count: 2, icon: 'alert-triangle' },
  ];
  protected selectedFilterIds = signal<string[]>(['active', 'verified']);

  protected scrollToSection(id: string): void {
    this.mobileSidebarOpen.set(false);
    if (!id) return;
    const targetId = (id === 'system-design' || id === 'dashboard') ? 'section-1' : id;
    if (typeof document !== 'undefined') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Standalone Pagination State
  protected standalonePage = signal(1);

  // Form states
  protected sampleName = signal('Sarah Connor');
  protected sampleEmail = signal('sarah@cyberdyne.com');
  protected sampleRole = signal('admin');
  protected sampleBio = signal('Lead systems architect specializing in scalable micro-frontends.');
  protected sampleDate = signal('2026-09-28');
  protected sampleDateRange = signal({ start: '2026-09-01', end: '2026-09-30' });
  protected sampleCity = signal('San Francisco');
  protected sampleSlider = signal(65);
  protected sampleCheckbox = signal(true);
  protected sampleSwitch = signal(true);
  protected sampleRadio = signal('opt1');

  protected dialogSlider = signal(30);

  // Authorization Demo
  protected authRole = computed(() => this.auth.user()?.role ?? 'admin');

  protected toggleDemoAdminRole(): void {
    const current = this.auth.user()?.role;
    if (current === 'admin') {
      this.auth.login({
        id: 'user-2',
        name: 'Sarah Connor',
        email: 'sarah@cyberdyne.com',
        role: 'user',
        permissions: ['read'],
      });
    } else {
      this.auth.login({
        id: 'user-1',
        name: 'Alex Morgan',
        email: 'alex.morgan@company.com',
        role: 'admin',
        permissions: ['users:write', 'users:delete', 'read', 'write'],
      });
    }
  }

  // Dropdown actions
  protected sampleDropdownActions: DropdownItem[] = [
    { id: 'edit', label: 'Edit Item', icon: 'edit' },
    { id: 'duplicate', label: 'Duplicate Entry', icon: 'copy' },
    { id: 'delete', label: 'Delete Item', icon: 'trash', danger: true },
  ];

  protected selectedTableRows = signal<unknown[]>([]);

  // Sample Select Options
  protected sampleRoleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Project Manager' },
    { value: 'member', label: 'Team Member' },
  ];

  protected sampleCityOptions = [
    { value: 'San Francisco', label: 'San Francisco, CA' },
    { value: 'New York', label: 'New York, NY' },
    { value: 'London', label: 'London, UK' },
    { value: 'Tokyo', label: 'Tokyo, JP' },
  ];

  protected sampleRadioOptions = [
    { value: 'opt1', label: 'Standard Tier' },
    { value: 'opt2', label: 'Enterprise Pro' },
  ];

  // Table Columns
  protected tableColumns: TableColumn[] = [
    { key: 'name', header: 'User', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
  ];

  // Master 25 Mock Records for Pagination
  protected allMockUsers = [
    { id: 1, name: 'Alex Morgan', email: 'alex@company.com', role: 'admin', status: 'Active' },
    { id: 2, name: 'Brian Miller', email: 'brian@company.com', role: 'manager', status: 'Pending' },
    { id: 3, name: 'Catherine Ross', email: 'catherine@company.com', role: 'member', status: 'Active' },
    { id: 4, name: 'David Zhao', email: 'david@company.com', role: 'guest', status: 'Inactive' },
    { id: 5, name: 'Elena Rostova', email: 'elena@company.com', role: 'admin', status: 'Active' },
    { id: 6, name: 'Frank Wright', email: 'frank@company.com', role: 'editor', status: 'Active' },
    { id: 7, name: 'Grace Hopper', email: 'grace@company.com', role: 'admin', status: 'Completed' },
    { id: 8, name: 'Henry Ford', email: 'henry@company.com', role: 'manager', status: 'Processing' },
    { id: 9, name: 'Iris West', email: 'iris@company.com', role: 'member', status: 'Active' },
    { id: 10, name: 'Jack Daniels', email: 'jack@company.com', role: 'guest', status: 'Error' },
    { id: 11, name: 'Karen Page', email: 'karen@company.com', role: 'editor', status: 'Active' },
    { id: 12, name: 'Luke Cage', email: 'luke@company.com', role: 'member', status: 'Draft' },
    { id: 13, name: 'Matt Murdock', email: 'matt@company.com', role: 'admin', status: 'Active' },
    { id: 14, name: 'Natasha Romanoff', email: 'natasha@company.com', role: 'super-admin', status: 'Active' },
    { id: 15, name: 'Oliver Queen', email: 'oliver@company.com', role: 'manager', status: 'Archived' },
    { id: 16, name: 'Peter Parker', email: 'peter@company.com', role: 'editor', status: 'Active' },
    { id: 17, name: 'Quentin Beck', email: 'quentin@company.com', role: 'guest', status: 'Error' },
    { id: 18, name: 'Reed Richards', email: 'reed@company.com', role: 'super-admin', status: 'Active' },
    { id: 19, name: 'Steve Rogers', email: 'steve@company.com', role: 'admin', status: 'Active' },
    { id: 20, name: 'Tony Stark', email: 'tony@company.com', role: 'super-admin', status: 'Active' },
    { id: 21, name: 'Ursula Buffay', email: 'ursula@company.com', role: 'guest', status: 'Inactive' },
    { id: 22, name: 'Victor Von Doom', email: 'victor@company.com', role: 'admin', status: 'Processing' },
    { id: 23, name: 'Wanda Maximoff', email: 'wanda@company.com', role: 'super-admin', status: 'Active' },
    { id: 24, name: 'Xavier Charles', email: 'xavier@company.com', role: 'admin', status: 'Completed' },
    { id: 25, name: 'Yvonne Strahovski', email: 'yvonne@company.com', role: 'editor', status: 'Active' },
  ];

  // Paginated Table State & Computed Slice
  protected paginatedTablePage = signal(1);
  protected paginatedTableRows = computed(() => {
    const page = this.paginatedTablePage();
    const size = 5;
    const start = (page - 1) * size;
    return this.allMockUsers.slice(start, start + size);
  });

  // Compact Table Data (First 4 rows, without pagination)
  protected compactTableData = this.allMockUsers.slice(0, 4);

  // Chart Sample Data
  protected sampleLineData: ChartDataPoint[] = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 48 },
    { label: 'Apr', value: 70 },
    { label: 'May', value: 65 },
    { label: 'Jun', value: 85 },
  ];

  protected sampleBarData: ChartDataPoint[] = [
    { label: 'Mon', value: 24 },
    { label: 'Tue', value: 42 },
    { label: 'Wed', value: 38 },
    { label: 'Thu', value: 65 },
    { label: 'Fri', value: 50 },
    { label: 'Sat', value: 18 },
  ];

  protected sampleAreaData: ChartDataPoint[] = [
    { label: '00h', value: 12 },
    { label: '04h', value: 8 },
    { label: '08h', value: 35 },
    { label: '12h', value: 64 },
    { label: '16h', value: 78 },
    { label: '20h', value: 45 },
  ];

  protected samplePieData: ChartDataPoint[] = [
    { label: 'Direct', value: 450 },
    { label: 'Organic', value: 320 },
    { label: 'Referral', value: 180 },
    { label: 'Social', value: 90 },
  ];

  protected sampleAvatarUsers = [
    { name: 'Alex Morgan' },
    { name: 'Brian Miller' },
    { name: 'Catherine Ross' },
    { name: 'David Zhao' },
    { name: 'Elena Rostova' },
    { name: 'Frank Wright' },
  ];

  protected sampleSteps = [
    { id: 'step-1', label: 'Account' },
    { id: 'step-2', label: 'Profile' },
    { id: 'step-3', label: 'Verification' },
  ];
  protected activeStepperStep = signal('step-2');

  protected sampleAccordionItems = [
    { id: 'acc-1', title: 'How is responsive design handled?', content: 'All components are mobile-first with Tailwind v4 breakpoints, with full layout adaptations on tablet and desktop.', defaultOpen: true },
    { id: 'acc-2', title: 'Are there any third-party dependencies?', content: 'Zero third-party UI dependencies. The entire system is built natively with Angular 22 Signals and pure Tailwind CSS.' },
  ];

  // Toast Triggers
  protected triggerSampleToast(): void {
    this.toast.success('Welcome to Admin Portal Design System!', {
      description: 'Explore all 77 components showcased on this page.',
    });
  }

  protected toastSuccess(): void {
    this.toast.success('Profile credentials saved successfully.');
  }

  protected toastError(): void {
    this.toast.error('Network request failed', {
      description: 'Could not connect to payment gateway.',
    });
  }

  protected toastWarning(): void {
    this.toast.warning('Unsaved changes detected in form.');
  }

  protected toastInfo(): void {
    this.toast.info('New platform update scheduled for midnight.');
  }

  protected confirmDelete(): void {
    this.toast.error('Customer account deleted.');
  }
}
