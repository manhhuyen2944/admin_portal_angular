import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNotification, NotificationType } from '../../../../core/services/notification.service';
import { IconComponent } from '../../icon/icon';
import type { IconName } from '../../icon/icon-registry';
import { IconButtonComponent } from '../../icon-button/icon-button';
import { ButtonComponent } from '../../button/button';

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: IconName; iconClass: string; bgClass: string }
> = {
  info: {
    icon: 'info',
    iconClass: 'text-info',
    bgClass: 'bg-info/10',
  },
  success: {
    icon: 'check-circle',
    iconClass: 'text-success',
    bgClass: 'bg-success/10',
  },
  warning: {
    icon: 'alert-triangle',
    iconClass: 'text-warning',
    bgClass: 'bg-warning/10',
  },
  error: {
    icon: 'alert-circle',
    iconClass: 'text-danger',
    bgClass: 'bg-danger/10',
  },
};

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * NotificationItem — individual notification row in the notification panel or feed.
 */
@Component({
  selector: 'app-notification-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, IconButtonComponent],
  template: `
    <div
      [class]="itemClasses()"
      (click)="handleClick()"
    >
      <!-- Type icon circle -->
      <div [class]="'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ' + config().bgClass">
        <app-icon [name]="config().icon" size="sm" [class]="config().iconClass" />
      </div>

      <!-- Content text -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">
          <h4 [class]="notification().read ? 'text-xs font-medium text-foreground' : 'text-xs font-semibold text-foreground'">
            {{ notification().title }}
          </h4>
          @if (!notification().read) {
            <span class="h-2 w-2 rounded-full bg-primary shrink-0" aria-label="Unread"></span>
          }
        </div>
        <p class="text-xs text-muted mt-0.5 line-clamp-2 leading-relaxed">
          {{ notification().message }}
        </p>
        <div class="flex items-center gap-3 mt-1.5">
          <span class="text-[11px] text-muted">{{ relativeTime() }}</span>
          @if (notification().actionLabel) {
            <span class="text-[11px] font-medium text-primary hover:underline cursor-pointer">
              {{ notification().actionLabel }}
            </span>
          }
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" (click)="$event.stopPropagation()">
        @if (!notification().read) {
          <app-icon-button
            name="check"
            label="Mark as read"
            size="xs"
            variant="ghost"
            class="text-muted hover:text-foreground"
            (click)="markRead.emit(notification().id)"
          />
        }
        <app-icon-button
          name="x"
          label="Remove notification"
          size="xs"
          variant="ghost"
          class="text-muted hover:text-danger"
          (click)="dismiss.emit(notification().id)"
        />
      </div>
    </div>
  `,
})
export class NotificationItemComponent {
  notification = input.required<AppNotification>();

  itemClick = output<AppNotification>();
  markRead = output<string>();
  dismiss = output<string>();

  protected readonly config = computed(() => TYPE_CONFIG[this.notification().type]);
  protected readonly relativeTime = computed(() => formatRelativeTime(this.notification().createdAt));

  protected itemClasses(): string {
    const base = 'group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer border-b border-border last:border-b-0';
    const bg = this.notification().read
      ? 'hover:bg-surface-raised/60'
      : 'bg-primary/[0.03] hover:bg-primary/[0.06]';
    return `${base} ${bg}`;
  }

  protected handleClick(): void {
    if (!this.notification().read) {
      this.markRead.emit(this.notification().id);
    }
    this.itemClick.emit(this.notification());
  }
}
