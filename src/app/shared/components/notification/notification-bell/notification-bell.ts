import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification.service';
import { IconComponent } from '../../icon/icon';
import { NotificationPanelComponent } from '../notification-panel/notification-panel';

/**
 * NotificationBell — bell trigger with unread counter badge and integrated panel.
 * Placed in Topbar or application header.
 *
 * Usage:
 *   <app-notification-bell />
 */
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, NotificationPanelComponent],
  template: `
    <div class="relative inline-block">
      <!-- Bell trigger button -->
      <button
        type="button"
        [class]="buttonClasses()"
        [attr.aria-label]="accessibleLabel()"
        [attr.aria-expanded]="panelOpen()"
        (click)="togglePanel()"
      >
        <app-icon name="bell" size="sm" class="transition-transform group-hover:scale-110" />

        <!-- Unread badge pill -->
        @if (notificationService.unreadCount() > 0) {
          <span
            class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white shadow-xs"
            aria-hidden="true"
          >
            {{ notificationService.unreadCountDisplay() }}
          </span>
        }
      </button>

      <!-- Panel overlay -->
      <app-notification-panel [(open)]="panelOpen" />
    </div>
  `,
})
export class NotificationBellComponent {
  readonly notificationService = inject(NotificationService);

  panelOpen = model(false);

  protected readonly accessibleLabel = computed(() => {
    const unread = this.notificationService.unreadCount();
    return unread > 0 ? `Notifications (${unread} unread)` : 'Notifications';
  });

  protected buttonClasses(): string {
    return [
      'relative flex h-9 w-9 items-center justify-center rounded-xl cursor-pointer',
      'text-foreground-secondary hover:text-foreground hover:bg-surface-raised',
      'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
    ].join(' ');
  }

  protected togglePanel(): void {
    this.panelOpen.update(v => !v);
  }
}
