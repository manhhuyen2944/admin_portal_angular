import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification } from '../../../../core/services/notification.service';
import { NotificationItemComponent } from '../notification-item/notification-item';
import { EmptyStateComponent } from '../../empty-state/empty-state';
import { ButtonComponent } from '../../button/button';
import { BadgeComponent } from '../../badge/badge';
import { IconComponent } from '../../icon/icon';
import { TranslatePipe } from '../../../pipes/translate.pipe';

/**
 * NotificationPanel — floating panel or full-drawer notification center.
 * Fully responsive on both mobile and desktop screens.
 */
@Component({
  selector: 'app-notification-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NotificationItemComponent,
    EmptyStateComponent,
    ButtonComponent,
    BadgeComponent,
    IconComponent,
    TranslatePipe,
  ],
  template: `
    @if (open()) {
      <!-- Backdrop for mobile / outside-click -->
      <div
        class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs sm:bg-transparent sm:backdrop-blur-none"
        (click)="closePanel()"
      ></div>

      <!-- Panel container: floating card below topbar on mobile, anchored popover on desktop -->
      <div
        class="fixed inset-x-2.5 top-16 z-[61] rounded-2xl border border-border bg-surface shadow-2xl flex flex-col
               sm:absolute sm:inset-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[380px] sm:max-h-[520px]
               max-h-[calc(100dvh-5rem)] overflow-hidden
               animate-in fade-in-0 zoom-in-95 sm:zoom-in-100 slide-in-from-top-2 duration-150"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border bg-surface shrink-0">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-foreground">
              {{ 'notification.title' | translate }}
            </h3>
            @if (notificationService.unreadCount() > 0) {
              <app-badge variant="primary" size="sm">
                {{ notificationService.unreadCountDisplay() }} {{ 'notification.newBadge' | translate }}
              </app-badge>
            }
          </div>

          <div class="flex items-center gap-1">
            @if (notificationService.unreadCount() > 0) {
              <app-button
                size="xs"
                variant="ghost"
                (click)="notificationService.markAllAsRead()"
              >
                {{ 'notification.markAllRead' | translate }}
              </app-button>
            }
            <button
              type="button"
              class="sm:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-raised cursor-pointer shrink-0"
              aria-label="Close"
              (click)="closePanel()"
            >
              <app-icon name="x" size="xs" />
            </button>
          </div>
        </div>

        <!-- Notification List -->
        <div class="flex-1 overflow-y-auto divide-y divide-border/60 overscroll-contain">
          @if (notificationService.notifications().length === 0) {
            <div class="py-10">
              <app-empty-state
                icon="bell"
                [title]="'notification.emptyTitle' | translate"
                [description]="'notification.emptyDesc' | translate"
              />
            </div>
          } @else {
            @for (item of notificationService.notifications(); track item.id) {
              <app-notification-item
                [notification]="item"
                (itemClick)="handleItemClick($event)"
                (markRead)="notificationService.markAsRead($event)"
                (dismiss)="notificationService.remove($event)"
              />
            }
          }
        </div>

        <!-- Footer -->
        @if (notificationService.notifications().length > 0) {
          <div class="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-raised/40 shrink-0">
            <span class="text-xs text-muted">
              {{ notificationService.notifications().length }} {{ 'notification.total' | translate }}
            </span>
            <app-button
              size="xs"
              variant="ghost"
              (click)="notificationService.clear()"
            >
              {{ 'notification.clearAll' | translate }}
            </app-button>
          </div>
        }
      </div>
    }
  `,
})
export class NotificationPanelComponent {
  readonly notificationService = inject(NotificationService);

  open = model(false);
  itemSelect = output<AppNotification>();

  protected closePanel(): void {
    this.open.set(false);
  }

  protected handleItemClick(notif: AppNotification): void {
    this.itemSelect.emit(notif);
  }
}
