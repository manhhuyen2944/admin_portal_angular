import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon';


export interface UserMenuUser {
  name: string;
  email: string;
  avatarUrl?: string;
  /** Initials fallback when no avatar. Default: first 2 chars of name */
  initials?: string;
}

/**
 * UserMenu — avatar + name dropdown in the Header.
 * Shows a popover with profile links on click.
 *
 * Note: Uses a built-in click-toggle dropdown.
 * TODO Phase 4: replace inner dropdown with <app-dropdown> when Dropdown is implemented.
 *
 * Usage (inside Header):
 *   <app-user-menu [user]="currentUser" (signOut)="authService.signOut()" />
 */
@Component({
  selector: 'app-user-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="relative">
      <!-- Trigger -->
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg px-2 py-1.5
               hover:bg-surface-raised transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="true"
        aria-label="User menu"
        (click)="toggle()"
      >
        <!-- Avatar -->
        <div class="relative h-8 w-8 shrink-0">
          @if (user().avatarUrl) {
            <img
              [src]="user().avatarUrl"
              [alt]="user().name"
              class="h-8 w-8 rounded-full object-cover ring-2 ring-border"
            />
          } @else {
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold ring-2 ring-border">
              {{ initials() }}
            </div>
          }
          <!-- Online dot -->
          <span class="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-success ring-2 ring-surface"></span>
        </div>

        <!-- Name (hidden on small screens) -->
        <div class="hidden sm:block text-left min-w-0">
          <p class="text-sm font-medium text-foreground truncate max-w-32">{{ user().name }}</p>
        </div>

        <app-icon
          [name]="isOpen() ? 'chevron-up' : 'chevron-down'"
          size="xs"
          class="text-muted hidden sm:block"
        />
      </button>

      <!-- Dropdown panel -->
      @if (isOpen()) {
        <!-- Backdrop -->
        <div class="fixed inset-0 z-[var(--z-dropdown)]" (click)="close()"></div>

        <div
          class="absolute right-0 top-full mt-2 w-64 z-[calc(var(--z-dropdown)+1)]
                 rounded-xl border border-border bg-surface shadow-xl
                 animate-in fade-in-0 zoom-in-95 duration-100"
          role="menu"
          aria-label="User menu"
        >
          <!-- User info -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-border">
            @if (user().avatarUrl) {
              <img [src]="user().avatarUrl" [alt]="user().name"
                   class="h-10 w-10 rounded-full object-cover shrink-0" />
            } @else {
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                {{ initials() }}
              </div>
            }
            <div class="min-w-0">
              <p class="text-sm font-semibold text-foreground truncate">{{ user().name }}</p>
              <p class="text-xs text-muted truncate">{{ user().email }}</p>
            </div>
          </div>

          <!-- Menu links -->
          <div class="p-1.5">
            <a routerLink="/profile"
               class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground
                      hover:bg-surface-raised transition-colors"
               role="menuitem" (click)="close()">
              <app-icon name="user" size="sm" class="text-muted" />
              <span>My Profile</span>
            </a>
            <a routerLink="/settings"
               class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground
                      hover:bg-surface-raised transition-colors"
               role="menuitem" (click)="close()">
              <app-icon name="settings" size="sm" class="text-muted" />
              <span>Settings</span>
            </a>
          </div>

          <!-- Sign out -->
          <div class="p-1.5 border-t border-border">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger
                     hover:bg-danger/5 transition-colors"
              role="menuitem"
              (click)="handleSignOut()"
            >
              <app-icon name="log-out" size="sm" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class UserMenuComponent {
  user = input.required<UserMenuUser>();

  signOut = output<void>();

  protected readonly isOpen = signal(false);

  protected readonly initials = computed(() => {
    if (this.user().initials) return this.user().initials!;
    return this.user().name.slice(0, 2).toUpperCase();
  });

  protected toggle(): void {
    this.isOpen.update(v => !v);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected handleSignOut(): void {
    this.close();
    this.signOut.emit();
  }
}
