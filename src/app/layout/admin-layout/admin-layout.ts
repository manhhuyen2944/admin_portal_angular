import {
  ChangeDetectionStrategy,
  Component,
  model,
  output,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { CommandPaletteComponent } from '../../shared';
import type { UserMenuUser } from '../user-menu/user-menu';
import { input } from '@angular/core';

/**
 * AdminLayout — the root shell component for the admin portal.
 * Composes: Sidebar + Header + content outlet + optional Footer.
 *
 * Responsive behaviour (single shell, no separate mobile layout):
 *   Mobile  — Sidebar hidden; hamburger in Header opens it as an overlay drawer.
 *   Tablet  — Sidebar collapses to icon-only rail.
 *   Desktop — Full sidebar always visible.
 *
 * Usage (in a lazy-loaded feature route or app.routes.ts):
 *   {
 *     path: '',
 *     component: AdminLayoutComponent,
 *     children: [
 *       { path: 'dashboard', component: DashboardPage },
 *       { path: 'users', component: UsersPage },
 *     ]
 *   }
 *
 *   <app-admin-layout [user]="currentUser" (signOut)="handleSignOut()">
 *     <!-- Sidebar nav items go here via ng-content[sidebar] -->
 *     <ng-container sidebar>
 *       <app-sidebar-item label="Dashboard" icon="layout-dashboard" routerLink="/dashboard" [exact]="true" />
 *       <app-sidebar-group label="Management">
 *         <app-sidebar-item label="Users" icon="users" routerLink="/users" />
 *       </app-sidebar-group>
 *     </ng-container>
 *   </app-admin-layout>
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent, CommandPaletteComponent],
  template: `
    <div class="flex h-dvh overflow-hidden bg-background">

      <!-- ───── Sidebar ───── -->
      <app-sidebar [(open)]="sidebarOpen" [(collapsed)]="sidebarCollapsed">
        <ng-content select="[sidebar]" />
      </app-sidebar>

      <!-- ───── Main column ───── -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

        <!-- Header -->
        <app-header
          [user]="user()"
          [(sidebarOpen)]="sidebarOpen"
          (signOut)="signOut.emit()"
          (openCommandPalette)="commandPaletteOpen.set(true)"
        >
          <ng-container header-left>
            <ng-content select="[header-left]" />
          </ng-container>
          <ng-container header-actions>
            <ng-content select="[header-actions]" />
          </ng-container>
        </app-header>

        <!-- Scrollable content area -->
        <main
          id="main-content"
          class="flex-1 overflow-y-auto overflow-x-hidden flex flex-col"
          tabindex="-1"
        >
          <div class="flex-1">
            <router-outlet />
          </div>

          <!-- Optional footer (non-sticky, scrolls with page content) -->
          @if (showFooter()) {
            <app-footer />
          }
        </main>
      </div>

      <!-- System-wide Spotlight Command Search -->
      <app-command-palette [(open)]="commandPaletteOpen" />
    </div>
  `,
})
export class AdminLayoutComponent {
  /** Currently logged-in user — passed to Header → UserMenu. */
  user = input<UserMenuUser | null>(null);

  /** Show the footer below content. Default: true. */
  showFooter = input(true);

  signOut = output<void>();

  /** Command palette open state */
  protected readonly commandPaletteOpen = signal(false);

  /** Mobile sidebar open state — shared with Header hamburger and Sidebar overlay. */
  protected sidebarOpen = model(false);

  /** Sidebar collapsed (rail) state — shared with Sidebar collapse button. */
  protected sidebarCollapsed = model(false);
}
