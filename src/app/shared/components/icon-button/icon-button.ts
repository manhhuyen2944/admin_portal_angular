import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent, type IconSize } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';
import type { ButtonVariant } from '../button/button';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark shadow-sm',
  secondary:
    'bg-secondary text-white hover:bg-secondary-dark shadow-sm',
  outline:
    'border border-border bg-surface text-foreground hover:bg-surface-raised',
  ghost:
    'bg-transparent text-foreground hover:bg-surface-raised',
  danger:
    'bg-danger text-white hover:bg-danger-dark shadow-sm',
  success:
    'bg-success text-white hover:bg-success-dark shadow-sm',
  warning:
    'bg-warning text-white hover:bg-warning-dark shadow-sm',
  link:
    'bg-transparent text-primary hover:text-primary-dark',
};

const SIZE_CLASSES: Record<IconSize, string> = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14',
};

/**
 * IconButton component — icon-only button, always requires a label for accessibility.
 *
 * Usage:
 *   <app-icon-button name="trash" label="Delete item" variant="danger" />
 *   <app-icon-button name="edit" label="Edit" variant="ghost" size="sm" />
 *
 * Rules:
 *   - `label` is REQUIRED — it becomes aria-label on the button.
 *   - Never use a raw <button> with an <svg> directly — use this component.
 */
@Component({
  selector: 'app-icon-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <button
      type="button"
      [disabled]="disabled() || loading()"
      [attr.aria-label]="label()"
      [attr.aria-disabled]="disabled() || loading() || null"
      [attr.aria-busy]="loading() || null"
      [class]="classes()"
      (click)="handleClick($event)"
    >
      @if (loading()) {
        <app-icon name="loader" [size]="size()" class="animate-spin" />
      } @else {
        <app-icon [name]="name()" [size]="size()" />
      }
    </button>
  `,
})
export class IconButtonComponent {
  /** Icon to display */
  name = input.required<IconName>();
  /** Accessible label — required for screen readers */
  label = input.required<string>();
  variant = input<ButtonVariant>('ghost');
  size = input<IconSize>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  clicked = output<MouseEvent>();

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 select-none';
    return [base, VARIANT_CLASSES[this.variant()], SIZE_CLASSES[this.size()]]
      .join(' ');
  });

  protected handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
