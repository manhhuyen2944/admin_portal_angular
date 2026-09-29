import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastItem, ToastService, ToastVariant } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';
import { IconButtonComponent } from '../icon-button/icon-button';
import { ButtonComponent } from '../button/button';

interface ToastVariantConfig {
  icon: IconName;
  iconClass: string;
  borderClass: string;
  bgClass: string;
  role: 'status' | 'alert';
  ariaLive: 'polite' | 'assertive';
}

const VARIANT_CONFIG: Record<ToastVariant, ToastVariantConfig> = {
  success: {
    icon: 'check-circle',
    iconClass: 'text-success bg-success/25 border border-success/30',
    borderClass: 'border-success/50 border-l-4 border-l-success',
    bgClass: 'bg-success/40',
    role: 'status',
    ariaLive: 'polite',
  },
  error: {
    icon: 'alert-circle',
    iconClass: 'text-danger bg-danger/25 border border-danger/30',
    borderClass: 'border-danger/50 border-l-4 border-l-danger',
    bgClass: 'bg-danger/40',
    role: 'alert',
    ariaLive: 'assertive',
  },
  warning: {
    icon: 'alert-triangle',
    iconClass: 'text-warning bg-warning/25 border border-warning/30',
    borderClass: 'border-warning/50 border-l-4 border-l-warning',
    bgClass: 'bg-warning/40',
    role: 'status',
    ariaLive: 'polite',
  },
  info: {
    icon: 'info',
    iconClass: 'text-info bg-info/25 border border-info/30',
    borderClass: 'border-info/50 border-l-4 border-l-info',
    bgClass: 'bg-info/40',
    role: 'status',
    ariaLive: 'polite',
  },
};

/**
 * ToastItemComponent — individual toast notification card.
 */
@Component({
  selector: 'app-toast-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, IconButtonComponent, ButtonComponent],
  template: `
    <div
      [class]="containerClasses()"
      [attr.role]="config().role"
      [attr.aria-live]="config().ariaLive"
      (mouseenter)="pauseTimer()"
      (mouseleave)="resumeTimer()"
      (focusin)="pauseTimer()"
      (focusout)="resumeTimer()"
    >
      <!-- Base opaque surface layer -->
      <div class="absolute inset-0 bg-surface rounded-xl -z-10" aria-hidden="true"></div>

      <!-- Icon -->
      <div [class]="'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ' + config().iconClass">
        <app-icon [name]="config().icon" size="md" />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0 pt-0.5">
        <p class="text-sm font-semibold text-foreground leading-snug">{{ toast().title }}</p>
        @if (toast().description) {
          <p class="text-xs text-muted mt-1 leading-relaxed">{{ toast().description }}</p>
        }
        @if (toast().action) {
          <div class="mt-2.5">
            <app-button
              size="xs"
              variant="outline"
              (click)="handleAction()"
            >
              {{ toast().action?.label }}
            </app-button>
          </div>
        }
      </div>

      <!-- Close button -->
      @if (toast().dismissible) {
        <app-icon-button
          name="x"
          label="Dismiss notification"
          size="xs"
          variant="ghost"
          class="-mr-1.5 -mt-1 shrink-0 text-muted hover:text-foreground cursor-pointer"
          (click)="dismiss.emit(toast().id)"
        />
      }
    </div>
  `,
})
export class ToastItemComponent implements OnInit {
  toast = input.required<ToastItem>();
  dismiss = output<string>();

  private readonly destroyRef = inject(DestroyRef);
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private remainingTime = 0;
  private startTime = 0;

  protected config(): ToastVariantConfig {
    return VARIANT_CONFIG[this.toast().variant];
  }

  protected containerClasses(): string {
    return [
      'relative flex items-start gap-3 p-4 rounded-xl border shadow-lg overflow-hidden',
      'transition-all duration-200 animate-in slide-in-from-top-2 fade-in-0',
      this.config().borderClass,
      this.config().bgClass,
    ].join(' ');
  }

  ngOnInit(): void {
    const dur = this.toast().duration;
    if (dur > 0) {
      this.remainingTime = dur;
      this.startTimer();
    }
  }

  protected pauseTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
      this.remainingTime -= Date.now() - this.startTime;
    }
  }

  protected resumeTimer(): void {
    if (this.toast().duration > 0 && this.remainingTime > 0) {
      this.startTimer();
    }
  }

  private startTimer(): void {
    this.startTime = Date.now();
    this.timerId = setTimeout(() => {
      this.dismiss.emit(this.toast().id);
    }, this.remainingTime);

    this.destroyRef.onDestroy(() => {
      if (this.timerId) clearTimeout(this.timerId);
    });
  }

  protected handleAction(): void {
    this.toast().action?.handler();
    this.dismiss.emit(this.toast().id);
  }
}

/**
 * ToastContainerComponent — viewport container hosting active toast messages.
 * Place once at the app root or inside AdminLayout.
 *
 * Responsive:
 *   - Mobile: pinned to bottom (safe area), 100% width
 *   - Tablet / Desktop: top-right stack, fixed max-width (w-96)
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ToastItemComponent],
  template: `
    <aside
      aria-label="Notifications"
      class="fixed z-[var(--z-toast,60)] flex flex-col gap-2.5 pointer-events-none
             bottom-4 inset-x-4 md:bottom-auto md:top-4 md:right-4 md:left-auto md:w-96 max-w-full"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto">
          <app-toast-item
            [toast]="toast"
            (dismiss)="toastService.dismiss($event)"
          />
        </div>
      }
    </aside>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
