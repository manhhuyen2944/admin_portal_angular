import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon';
import type { IconName } from '../../shared/components/icon/icon-registry';

/**
 * SidebarItem — a single navigation link in the sidebar.
 * Emits (click) so the parent Sidebar can close the mobile drawer on nav.
 *
 * Usage (inside SidebarGroup or Sidebar):
 *   <app-sidebar-item
 *     label="Dashboard"
 *     icon="layout-dashboard"
 *     routerLink="/dashboard"
 *   />
 */
@Component({
  selector: 'app-sidebar-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <a
      [routerLink]="link()"
      routerLinkActive="bg-sidebar-active/15 text-white font-medium"
      [routerLinkActiveOptions]="{ exact: exact() }"
      [attr.title]="collapsed() ? label() : null"
      class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-text
             transition-all duration-150
             hover:bg-sidebar-hover hover:text-white
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      (click)="itemClick.emit()"
    >
      @if (icon()) {
        <app-icon
          [name]="icon()!"
          size="sm"
          class="shrink-0 opacity-75 group-hover:opacity-100"
        />
      }

      @if (!collapsed()) {
        <span class="truncate leading-none">{{ label() }}</span>

        @if (badge()) {
          <span class="ml-auto text-xs bg-primary/20 text-primary-light px-1.5 py-0.5 rounded-full leading-none">
            {{ badge() }}
          </span>
        }
      }
    </a>
  `,
})
export class SidebarItemComponent {
  label = input.required<string>();
  link = input.required<string | string[]>();
  icon = input<IconName | undefined>(undefined);
  /** Show a badge (e.g. unread count) */
  badge = input<string | number | undefined>(undefined);
  /** Whether sidebar is in collapsed/rail mode — hides label */
  collapsed = input(false);
  /** Whether routerLinkActive should match exact path */
  exact = input(false);

  itemClick = output<void>();
}
