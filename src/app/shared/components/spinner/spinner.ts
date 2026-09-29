import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<SpinnerSize, number> = {
  xs: 12, sm: 16, md: 20, lg: 24, xl: 32,
};

/**
 * Spinner — indeterminate loading indicator for actions and buttons.
 * Use Progress for measurable work (file upload, multi-step).
 *
 * Usage:
 *   <app-spinner />
 *   <app-spinner size="sm" />
 *   <app-spinner label="Saving..." />   <!-- shows text next to spinner -->
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    '[attr.role]': '"status"',
    '[attr.aria-live]': '"polite"',
    'class': 'inline-flex items-center gap-2',
  },
  template: `
    <app-icon
      name="loader"
      [size]="size()"
      class="animate-spin text-current"
      [attr.aria-hidden]="label() ? 'true' : null"
    />
    @if (label()) {
      <span class="text-sm text-foreground-secondary">{{ label() }}</span>
    } @else {
      <span class="sr-only">Loading…</span>
    }
  `,
})
export class SpinnerComponent {
  size = input<SpinnerSize>('md');
  label = input<string | undefined>(undefined);
}
