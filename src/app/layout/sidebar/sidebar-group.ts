import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * SidebarGroup — a labeled section that groups SidebarItems.
 *
 * Usage:
 *   <app-sidebar-group label="Management">
 *     <app-sidebar-item label="Users" icon="users" routerLink="/users" />
 *     <app-sidebar-item label="Roles" icon="shield" routerLink="/roles" />
 *   </app-sidebar-group>
 */
@Component({
  selector: 'app-sidebar-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-1">
      @if (label() && !collapsed()) {
        <p class="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted select-none">
          {{ label() }}
        </p>
      } @else if (collapsed()) {
        <!-- divider in rail mode -->
        <div class="mx-3 my-2 border-t border-sidebar-hover"></div>
      }
      <div class="flex flex-col gap-0.5">
        <ng-content />
      </div>
    </div>
  `,
})
export class SidebarGroupComponent {
  /** Section heading — hidden when sidebar is collapsed */
  label = input<string | undefined>(undefined);
  /** Passed down from Sidebar — hides label text in rail mode */
  collapsed = input(false);
}
