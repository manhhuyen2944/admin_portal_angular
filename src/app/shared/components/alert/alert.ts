import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';
import { IconButtonComponent } from '../icon-button/icon-button';
import { ButtonComponent } from '../button/button';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const VARIANT_CONFIG: Record<
  AlertVariant,
  { icon: IconName; iconClass: string; bgClass: string; borderClass: string; textClass: string }
> = {
  info: {
    icon: 'info',
    iconClass: 'text-info',
    bgClass: 'bg-info/10',
    borderClass: 'border-info/30',
    textClass: 'text-info',
  },
  success: {
    icon: 'check-circle',
    iconClass: 'text-success',
    bgClass: 'bg-success/10',
    borderClass: 'border-success/30',
    textClass: 'text-success',
  },
  warning: {
    icon: 'alert-triangle',
    iconClass: 'text-warning',
    bgClass: 'bg-warning/10',
    borderClass: 'border-warning/30',
    textClass: 'text-warning',
  },
  danger: {
    icon: 'alert-circle',
    iconClass: 'text-danger',
    bgClass: 'bg-danger/10',
    borderClass: 'border-danger/30',
    textClass: 'text-danger',
  },
};

/**
 * Alert / Banner — inline or system-wide contextual notification.
 *
 * Usage:
 *   <!-- Standard inline alert -->
 *   <app-alert variant="warning" title="Warning" description="Your license expires soon." />
 *
 *   <!-- Top layout banner -->
 *   <app-alert [banner]="true" variant="info" title="System Maintenance tonight at 10 PM." />
 *
 *   <!-- Alert with action button and dismissible -->
 *   <app-alert
 *     variant="danger"
 *     title="Sync Failed"
 *     description="Unable to sync with remote server."
 *     actionLabel="Retry"
 *     [dismissible]="true"
 *     (actionClick)="retrySync()"
 *     (dismiss)="alertClosed()"
 *   />
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, IconButtonComponent, ButtonComponent],
  template: `
    @if (!dismissed()) {
      <div
        [class]="containerClasses()"
        role="alert"
      >
        <div class="flex items-start gap-3 flex-1 min-w-0">
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            <app-icon [name]="iconName()" size="sm" [class]="config().iconClass" />
          </div>

          <!-- Main Text -->
          <div class="flex-1 min-w-0">
            @if (title()) {
              <h4 class="text-sm font-semibold text-foreground leading-snug">{{ title() }}</h4>
            }
            @if (description()) {
              <p class="text-sm text-foreground-secondary mt-0.5 leading-relaxed">{{ description() }}</p>
            }
            <ng-content />

            <!-- Mobile Action Button (stacked below) -->
            @if (actionLabel()) {
              <div class="mt-2.5 sm:hidden">
                <app-button
                  size="xs"
                  variant="outline"
                  (click)="actionClick.emit()"
                >
                  {{ actionLabel() }}
                </app-button>
              </div>
            }
          </div>
        </div>

        <!-- Desktop Action + Close -->
        <div class="flex items-center gap-2 shrink-0">
          @if (actionLabel()) {
            <div class="hidden sm:block">
              <app-button
                size="xs"
                variant="outline"
                (click)="actionClick.emit()"
              >
                {{ actionLabel() }}
              </app-button>
            </div>
          }
          <ng-content select="[alert-action]" />

          @if (dismissible()) {
            <app-icon-button
              name="x"
              label="Dismiss alert"
              size="xs"
              variant="ghost"
              class="text-muted hover:text-foreground -mr-1 -mt-1"
              (click)="handleDismiss()"
            />
          }
        </div>
      </div>
    }
  `,
})
export class AlertComponent {
  variant = input<AlertVariant>('info');
  title = input<string | undefined>(undefined);
  description = input<string | undefined>(undefined);
  icon = input<IconName | undefined>(undefined);
  banner = input(false);
  dismissible = input(false);
  actionLabel = input<string | undefined>(undefined);

  actionClick = output<void>();
  dismiss = output<void>();

  protected readonly dismissed = model(false);

  protected readonly config = computed(() => VARIANT_CONFIG[this.variant()]);

  protected readonly iconName = computed<IconName>(() => {
    return this.icon() ?? this.config().icon;
  });

  protected readonly containerClasses = computed(() => {
    const cfg = this.config();
    if (this.banner()) {
      return `flex items-center justify-between gap-4 px-4 py-3 border-b ${cfg.bgClass} ${cfg.borderClass} w-full`;
    }
    return `flex items-start justify-between gap-4 p-4 rounded-xl border ${cfg.bgClass} ${cfg.borderClass} w-full`;
  });

  protected handleDismiss(): void {
    this.dismissed.set(true);
    this.dismiss.emit();
  }
}
