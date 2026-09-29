import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import {
  IconComponent,
  type IconName,
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
  badge?: string;
  icon?: IconName;
  subItems?: SidebarSubItem[];
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
    RouterLinkActive,
    IconComponent,
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
  showUserFooter = input(false);

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

  private router = inject(Router, { optional: true });

  /** Submenu accordion expansion map (supports level 1 accordion) */
  protected expandedSubmenus = signal<Record<string, boolean>>({
    'authentication': true,
  });

  /** Sub-version / group tab selection (e.g. 'auth-v1' or 'auth-v2') */
  protected selectedSubGroup = signal<Record<string, string>>({
    'authentication': 'auth-v1',
  });

  constructor() {
    this.updateActiveGroupFromUrl(this.router?.url);
    this.router?.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateActiveGroupFromUrl(event.urlAfterRedirects || event.url);
      }
    });
  }

  private updateActiveGroupFromUrl(url?: string): void {
    if (!url) return;
    if (url.includes('auth-v2')) {
      this.selectedSubGroup.update((prev) => ({ ...prev, authentication: 'auth-v2' }));
    } else if (url.includes('/auth/')) {
      this.selectedSubGroup.update((prev) => ({ ...prev, authentication: 'auth-v1' }));
    }
  }

  protected hasSubGroups(sec: SidebarNavSection): boolean {
    return !!sec.subItems?.some((sub) => sub.subItems && sub.subItems.length > 0);
  }

  protected getActiveSubGroupId(sec: SidebarNavSection): string {
    return this.selectedSubGroup()[sec.id] || sec.subItems?.[0]?.id || '';
  }

  protected getActiveSubGroup(sec: SidebarNavSection): SidebarSubItem | undefined {
    if (!sec.subItems || sec.subItems.length === 0) return undefined;
    const currentId = this.getActiveSubGroupId(sec);
    return sec.subItems.find((s) => s.id === currentId) ?? sec.subItems[0];
  }

  protected setSubGroup(secId: string, groupId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.selectedSubGroup.update((prev) => ({
      ...prev,
      [secId]: groupId,
    }));
  }

  protected isExpanded(id: string): boolean {
    return !!this.expandedSubmenus()[id];
  }

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
  }

  close(): void {
    this.setDrawerOpen(false);
  }

  protected onParentNavClick(sec: SidebarNavSection): void {
    if (sec.subItems && sec.subItems.length > 0) {
      this.toggleSubmenu(sec.id);
      this.sectionClick.emit(sec.id);
    } else {
      this.onSubItemClick(sec.id);
    }
  }

  protected toggleSubmenu(secId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.expandedSubmenus.update((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  }

  protected onSubParentClick(sub: SidebarSubItem, event?: Event): void {
    if (sub.subItems && sub.subItems.length > 0) {
      if (sub.id) {
        this.toggleSubmenu(sub.id, event);
      }
    } else {
      this.onSubItemClick(sub.id ?? '');
    }
  }

  protected onSubItemClick(id: string): void {
    this.setDrawerOpen(false);
    this.sectionClick.emit(id);
    this.navigated.emit();
  }
}

/** Backward-compatible alias for existing imports */
export { SidebarComponent as SystemDesignSidebarComponent };
