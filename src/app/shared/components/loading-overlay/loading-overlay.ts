import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner';

/**
 * LoadingOverlay — semi-transparent loading shield for containers or full screen.
 *
 * Usage:
 *   <!-- Relative container loading -->
 *   <div class="relative min-h-64">
 *     @if (loading()) {
 *       <app-loading-overlay message="Saving changes..." />
 *     }
 *     <app-data-table ... />
 *   </div>
 *
 *   <!-- Full page modal loading -->
 *   <app-loading-overlay [fullScreen]="true" message="Initializing session..." />
 */
@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div
      [class]="overlayClasses()"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="flex flex-col items-center justify-center gap-3 p-6 text-center max-w-sm">
        <app-spinner [size]="spinnerSize()" color="primary" />
        @if (message()) {
          <p class="text-sm font-medium text-foreground">{{ message() }}</p>
        }
        @if (description()) {
          <p class="text-xs text-muted">{{ description() }}</p>
        }
      </div>
    </div>
  `,
})
export class LoadingOverlayComponent {
  message = input<string | undefined>('Loading...');
  description = input<string | undefined>(undefined);
  fullScreen = input(false);
  spinnerSize = input<'sm' | 'md' | 'lg'>('lg');

  protected readonly overlayClasses = computed(() => {
    const base = 'flex items-center justify-center bg-surface/75 backdrop-blur-xs transition-opacity duration-200';
    if (this.fullScreen()) {
      return `${base} fixed inset-0 z-[var(--z-dialog,50)]`;
    }
    return `${base} absolute inset-0 z-20 rounded-[inherit]`;
  });
}
