import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { ButtonComponent } from '../button/button';

/**
 * ErrorState — error message screen or section with retry action.
 *
 * Usage:
 *   <app-error-state
 *     title="Failed to load dashboard metrics"
 *     description="Network connection timed out while querying the database."
 *     errorCode="504"
 *     (retry)="reloadMetrics()"
 *   />
 */
@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, ButtonComponent],
  template: `
    <div class="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto">
      <!-- Error icon badge -->
      <div class="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-danger/10 border border-danger/20 text-danger mb-4">
        <app-icon name="alert-triangle" size="lg" />
      </div>

      <!-- Error code badge -->
      @if (errorCode()) {
        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-surface-raised border border-border text-muted mb-2 font-mono">
          Error {{ errorCode() }}
        </span>
      }

      <!-- Title & message -->
      <h3 class="text-base sm:text-lg font-semibold text-foreground">{{ title() }}</h3>
      @if (description()) {
        <p class="text-sm text-muted mt-1.5 max-w-sm leading-relaxed">{{ description() }}</p>
      }

      <!-- Actions -->
      <div class="flex flex-wrap items-center justify-center gap-3 mt-6">
        @if (showRetry()) {
          <app-button
            variant="primary"
            size="sm"
            icon="refresh"
            (click)="retry.emit()"
          >
            {{ retryLabel() }}
          </app-button>
        }
        @if (homeLabel()) {
          <app-button
            variant="outline"
            size="sm"
            icon="home"
            (click)="homeClick.emit()"
          >
            {{ homeLabel() }}
          </app-button>
        }
        <ng-content select="[error-actions]" />
      </div>
    </div>
  `,
})
export class ErrorStateComponent {
  title = input('Something went wrong');
  description = input<string | undefined>('An unexpected error occurred. Please try again.');
  errorCode = input<string | number | undefined>(undefined);
  retryLabel = input('Try again');
  showRetry = input(true);
  homeLabel = input<string | undefined>(undefined);

  retry = output<void>();
  homeClick = output<void>();
}
