import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IconComponent,
  type IconName,
  AvatarComponent,
  IconButtonComponent,
  ButtonComponent,
  DrawerComponent,
  LanguageSelectorComponent,
  DensitySelectorComponent,
  TranslatePipe,
} from '../../shared';
import type { UserMenuUser } from '../user-menu/user-menu';

export interface SidebarSubItem {
  label: string;
  id?: string;
  routerLink?: string;
}

export interface SidebarNavSection {
  id: string;
  title: string;
  icon?: IconName;
  badge?: string;
  routerLink?: string;
  subItems?: SidebarSubItem[];
}

/** Backward-compatible alias for existing imports */
export type SystemDesignNavSection = SidebarNavSection;

/**
 * SidebarComponent — unified global navigation sidebar for the entire application.
 *
 * Features:
 * - Desktop collapsible rail mode (collapsed: w-72 -> w-[72px])
 * - Floating chevron collapse/expand toggle button centered on the border
 * - Accordion submenus with smooth animation & bullet indicators
 * - Custom projection (<ng-content />) or structured sections configuration
 * - Mobile slideout drawer (<app-drawer>)
 * - User profile footer with sign out
 *
 * Usage:
 *   <app-sidebar [sections]="menuSections" [(collapsed)]="isCollapsed" />
 *   <app-sidebar [(open)]="sidebarOpen">
 *     <app-sidebar-item label="Dashboard" routerLink="/dashboard" icon="layout-dashboard" />
 *   </app-sidebar>
 */
@Component({
  selector: 'app-sidebar, app-system-design-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    AvatarComponent,
    IconButtonComponent,
    ButtonComponent,
    DrawerComponent,
    LanguageSelectorComponent,
    DensitySelectorComponent,
    TranslatePipe,
  ],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  /** Optional structured navigation sections */
  sections = input<SidebarNavSection[] | null>(null);

  /** Mobile drawer open state (bound as [(open)] in AdminLayout) */
  open = model(false);

  /** Mobile drawer open state alias (bound as [(mobileOpen)] in SystemDesign) */
  mobileOpen = model(false);

  /** Desktop sidebar collapsed (rail) state */
  collapsed = model(false);

  /** Brand info */
  brandTitle = input('Admin Portal');
  brandSubtitle = input<string | undefined>('Component Catalog');
  brandBadge = input<string | undefined>('77');
  brandIcon = input<IconName>('layout-dashboard');
  showBrand = input(true);

  /** Section category heading above items (e.g. 'Sections Catalog') */
  sectionHeading = input<string | undefined>('Sections Catalog');

  /** User profile data */
  user = input<UserMenuUser | null>(null);
  showUserFooter = input(true);

  /** Mobile quick preference controls (Language, Density, Toast) */
  showControls = input(false);

  /** Events */
  sectionClick = output<string>();
  navigated = output<void>();
  signOut = output<void>();
  toastTrigger = output<void>();

  /** Synchronized drawer open state for mobile drawer */
  protected drawerOpen = computed(() => this.open() || this.mobileOpen());

  protected setDrawerOpen(val: boolean): void {
    this.open.set(val);
    this.mobileOpen.set(val);
  }

  /** Default user fallback when none is provided */
  protected readonly defaultUser: { name: string; email: string; role?: string } = {
    name: 'Sarah Connor',
    email: 'sarah@cyberdyne.com',
    role: 'Admin • Online',
  };

  protected readonly effectiveUser = computed(() => {
    const u = this.user();
    if (u) {
      return {
        name: u.name,
        email: u.email,
        role: (u as { role?: string }).role ?? 'Online',
      };
    }
    return this.defaultUser;
  });

  /** Submenu accordion expansion map */
  protected expandedSubmenus = signal<Record<string, boolean>>({
    'system-design': true,
    'authentication': false,
    'dashboard': false,
    'users': false,
    'settings': false,
    'section-1': false,
    'section-2': true,
    'section-4': true,
  });

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
  }

  close(): void {
    this.setDrawerOpen(false);
  }

  protected onParentNavClick(sec: SidebarNavSection): void {
    if (sec.subItems && sec.subItems.length > 0) {
      this.expandedSubmenus.update((prev) => ({
        ...prev,
        [sec.id]: !prev[sec.id],
      }));
      this.sectionClick.emit(sec.id);
    } else {
      this.onSubItemClick(sec.id);
    }
  }

  protected toggleSubmenu(secId: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.expandedSubmenus.update((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  }

  protected onSubItemClick(id: string): void {
    this.setDrawerOpen(false);
    this.sectionClick.emit(id);
    this.navigated.emit();
  }
}

/** Backward-compatible alias for existing imports */
export { SidebarComponent as SystemDesignSidebarComponent };
