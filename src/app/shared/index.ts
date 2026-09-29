/**
 * Shared components barrel — single import point.
 * Import from here: import { ButtonComponent } from '../shared';
 */

// Foundation
export { IconComponent } from './components/icon/icon';
export type { IconSize } from './components/icon/icon';
export { ICON_REGISTRY } from './components/icon/icon-registry';
export type { IconName } from './components/icon/icon-registry';
export { ButtonComponent } from './components/button/button';
export type { ButtonVariant, ButtonSize } from './components/button/button';
export { IconButtonComponent } from './components/icon-button/icon-button';
export { ButtonGroupComponent } from './components/button-group/button-group';
export type { ButtonGroupItem, ButtonGroupOrientation } from './components/button-group/button-group';
export { LoadingShimmerComponent } from './components/loading-shimmer/loading-shimmer';
export { SpinnerComponent } from './components/spinner/spinner';
export { BadgeComponent } from './components/badge/badge';
export type { BadgeVariant, BadgeSize } from './components/badge/badge';
export { StatusBadgeComponent, STATUS_MAP } from './components/status-badge/status-badge';
export type { AppStatus } from './components/status-badge/status-badge';

// Forms
export { FormFieldComponent } from './components/form-field/form-field';
export { FormControlBase } from './components/form-field/form-control-base';
export { InputComponent } from './components/input/input';
export type { InputType, InputSize } from './components/input/input';
export { TextareaComponent } from './components/textarea/textarea';
export { SelectComponent } from './components/select/select';
export type { SelectOption, SelectMode } from './components/select/select';
export { MultiSelectComponent } from './components/multi-select/multi-select';
export { CheckboxComponent } from './components/checkbox/checkbox';
export { RadioComponent } from './components/radio/radio';
export type { RadioOption } from './components/radio/radio';
export { SwitchComponent } from './components/switch/switch';
export { SliderComponent } from './components/slider/slider';
export { AutocompleteComponent } from './components/autocomplete/autocomplete';
export type { AutocompleteOption } from './components/autocomplete/autocomplete';
export { DatePickerComponent } from './components/date-picker/date-picker';
export type { DatePickerMode } from './components/date-picker/date-picker';
export { DateRangePickerComponent } from './components/date-range-picker/date-range-picker';
export type { DateRangeValue } from './components/date-range-picker/date-range-picker';
export { QuickFiltersComponent } from './components/quick-filters/quick-filters';
export type { QuickFilterOption } from './components/quick-filters/quick-filters';
export { FileUploadComponent } from './components/file-upload/file-upload';
export type { UploadedFile } from './components/file-upload/file-upload';

// Overlays (Phase 4)
export { DialogComponent } from './components/dialog/dialog';
export type { DialogSize } from './components/dialog/dialog';
export { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog';
export type { ConfirmDialogVariant } from './components/confirm-dialog/confirm-dialog';
export { DrawerComponent } from './components/drawer/drawer';
export type { DrawerPosition, DrawerSize } from './components/drawer/drawer';
export { DropdownComponent } from './components/dropdown/dropdown';
export type { DropdownItem, DropdownAlign } from './components/dropdown/dropdown';
export { PopoverComponent } from './components/popover/popover';
export type { PopoverPosition, PopoverAlign, PopoverSide } from './components/popover/popover';
export { TooltipDirective } from './components/tooltip/tooltip.directive';
export type { TooltipPosition } from './components/tooltip/tooltip.directive';
export { MenuComponent } from './components/menu/menu';

// Navigation & Display (Phase 5)
export { BreadcrumbComponent } from './components/breadcrumb/breadcrumb';
export type { BreadcrumbItem } from './components/breadcrumb/breadcrumb';
export { TabsComponent } from './components/tabs/tabs';
export type { TabItem } from './components/tabs/tabs';
export { PaginationComponent } from './components/pagination/pagination';
export { StepperComponent } from './components/stepper/stepper';
export type { StepperStep, StepperOrientation } from './components/stepper/stepper';
export { AvatarComponent, AvatarGroupComponent } from './components/avatar/avatar';
export type { AvatarSize } from './components/avatar/avatar';
export { RoleBadgeComponent, ROLE_MAP } from './components/role-badge/role-badge';
export type { AppRole } from './components/role-badge/role-badge';
export { TagComponent } from './components/tag/tag';
export type { TagVariant, TagSize } from './components/tag/tag';
export { StatusTagComponent } from './components/status-tag/status-tag';
export { AccordionComponent, AccordionItemComponent } from './components/accordion/accordion';
export type { AccordionItem } from './components/accordion/accordion';
export {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  CardFooterComponent,
} from './components/card/card';
export { StatCardComponent } from './components/stat-card/stat-card';
export { ProgressComponent } from './components/progress/progress';
export type { ProgressVariant, ProgressSize } from './components/progress/progress';
export { DataTableComponent } from './components/data-table/data-table';
export type { TableColumn, SortState, SortDirection, ColumnAlign, TableRowAction } from './components/data-table/data-table';

// Feedback & States (Phase 6)
export { ToastItemComponent, ToastContainerComponent } from './components/toast/toast';
export { AlertComponent } from './components/alert/alert';
export type { AlertVariant } from './components/alert/alert';
export { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay';
export { EmptyStateComponent } from './components/empty-state/empty-state';
export { ErrorStateComponent } from './components/error-state/error-state';
export { AccessDeniedComponent, NoPermissionComponent } from './components/no-permission/no-permission';
export { NotFoundComponent } from './components/not-found/not-found';
export { OfflineStateComponent } from './components/offline-state/offline-state';
export type { OfflineDisplayMode } from './components/offline-state/offline-state';

// Notification System (Phase 7)
export { NotificationBellComponent } from './components/notification/notification-bell/notification-bell';
export { NotificationPanelComponent } from './components/notification/notification-panel/notification-panel';
export { NotificationItemComponent } from './components/notification/notification-item/notification-item';

// Authorization & Theming (Phase 8)
export { PermissionGateDirective } from './directives/permission-gate/permission-gate.directive';
export { RoleGateDirective } from './directives/role-gate/role-gate.directive';
export { ThemeSelectorComponent } from './components/theme-selector/theme-selector';
export type { AppTheme } from './components/theme-selector/theme-selector';
export { LanguageSelectorComponent } from './components/language-selector/language-selector';
export type { LanguageOption } from './components/language-selector/language-selector';
export { DensitySelectorComponent } from './components/density-selector/density-selector';
export type { AppDensity } from './components/density-selector/density-selector';

// Charts (Phase 10)
export { LineChartComponent } from './components/charts/line-chart/line-chart';
export { BarChartComponent } from './components/charts/bar-chart/bar-chart';
export { AreaChartComponent } from './components/charts/area-chart/area-chart';
export { PieChartComponent } from './components/charts/pie-chart/pie-chart';
export { ChartCardComponent } from './components/charts/chart-card/chart-card';
export type { ChartDataPoint, ChartSeries } from './components/charts/chart.types';

// Advanced Navigation (Phase 11)
export { CommandPaletteComponent } from './components/command-palette/command-palette';
export type { CommandItem } from './components/command-palette/command-palette';

// Auth Shared Components (Phase 12)
export { OtpInputComponent } from './components/otp-input/otp-input';
export { QrCodeComponent } from './components/qr-code/qr-code';

// Pipes (i18n)
export { TranslatePipe } from './pipes/translate.pipe';

// Layout & Hierarchical (Phase 13)
export { GridComponent, GridColComponent } from './components/grid/grid';
export type { GridCols, ColSpan, GridGap, GridAlign, GridJustify } from './components/grid/grid';
export { TreeViewComponent } from './components/tree-view/tree-view';
export type { TreeNode } from './components/tree-view/tree-view';
