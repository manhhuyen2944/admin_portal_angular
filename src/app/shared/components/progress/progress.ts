import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ProgressVariant, string> = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
  info:    'bg-info',
};

const SIZE_CLASSES: Record<ProgressSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

/**
 * Progress — progress bar for measurable work.
 * Use Spinner for indeterminate loading; Progress for known completion percentage.
 *
 * Usage:
 *   <app-progress [value]="uploadProgress" label="Uploading..." />
 *   <app-progress [value]="75" variant="success" [showPercent]="true" />
 *   <app-progress [indeterminate]="true" label="Processing..." />
 */
@Component({
  selector: 'app-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      @if (label() || showPercent()) {
        <div class="flex items-center justify-between gap-2">
          @if (label()) {
            <span class="text-sm text-foreground-secondary">{{ label() }}</span>
          }
          @if (showPercent() && !indeterminate()) {
            <span class="text-sm font-semibold text-foreground tabular-nums">{{ clampedValue() }}%</span>
          }
        </div>
      }

      <div
        class="w-full rounded-full overflow-hidden bg-surface-raised"
        [class]="SIZE_CLASSES[size()]"
        role="progressbar"
        [attr.aria-valuenow]="indeterminate() ? null : clampedValue()"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="100"
        [attr.aria-label]="label() || 'Progress'"
      >
        <div
          [class]="barClasses()"
          [style.width]="indeterminate() ? '40%' : clampedValue() + '%'"
        ></div>
      </div>
    </div>
  `,
})
export class ProgressComponent {
  /** 0–100 percentage. */
  value = input(0);
  variant = input<ProgressVariant>('default');
  size = input<ProgressSize>('md');
  label = input<string | undefined>(undefined);
  showPercent = input(false);
  /** Indeterminate animation for unknown duration. */
  indeterminate = input(false);

  protected readonly SIZE_CLASSES = SIZE_CLASSES;
  protected readonly clampedValue = computed(() => Math.max(0, Math.min(100, this.value())));

  protected barClasses(): string {
    const base = 'h-full rounded-full transition-all duration-500 ease-out';
    const color = VARIANT_CLASSES[this.variant()];
    const anim = this.indeterminate() ? 'animate-pulse origin-left' : '';
    return `${base} ${color} ${anim}`.trim();
  }
}
