import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent, type IconSize } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-sm',
  secondary:
    'bg-secondary text-white hover:bg-secondary-dark active:scale-[0.98] shadow-sm',
  outline:
    'border border-border bg-surface text-foreground hover:bg-surface-raised active:scale-[0.98]',
  ghost:
    'bg-transparent text-foreground hover:bg-surface-raised active:scale-[0.98]',
  danger:
    'bg-danger text-white hover:bg-danger-dark active:scale-[0.98] shadow-sm',
  success:
    'bg-success text-white hover:bg-success-dark active:scale-[0.98] shadow-sm',
  warning:
    'bg-warning text-white hover:bg-warning-dark active:scale-[0.98] shadow-sm',
  link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const ICON_SIZE_MAP: Record<ButtonSize, IconSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

/**
 * Button component — single button system for the entire app.
 *
 * Usage:
 *   <app-button variant="primary">Save</app-button>
 *   <app-button variant="danger" size="sm" [loading]="isSaving">Delete</app-button>
 *   <app-button variant="outline" icon="plus">Add item</app-button>
 *   <app-button variant="primary" [fullWidth]="true">Submit</app-button>
 *
 * Rules:
 *   - Never create DangerButton, SmallButton, LoadingButton — use variant/size/loading.
 *   - All variants use design tokens — never hard-code colors.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.block]': 'fullWidth()',
    '[class.w-full]': 'fullWidth()',
    '[class.inline-block]': '!fullWidth()',
  },
  imports: [IconComponent],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-disabled]="disabled() || loading() || null"
      [attr.aria-busy]="loading() || null"
      [class]="classes()"
      (click)="handleClick($event)"
    >
      @if (loading()) {
        <app-icon name="loader" [size]="iconSize()" class="animate-spin" />
      } @else if (icon()) {
        <app-icon [name]="icon()!" [size]="iconSize()" />
      }

      @if (loading() && loadingText()) {
        {{ loadingText() }}
      } @else {
        <ng-content />
      }
    </button>
  `,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<ButtonType>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  loadingText = input<string | undefined>(undefined);
  fullWidth = input<boolean>(false);
  /** Optional leading icon */
  icon = input<IconName | undefined>(undefined);

  clicked = output<MouseEvent>();

  protected readonly iconSize = computed(() => ICON_SIZE_MAP[this.size()]);

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';
    const variant = VARIANT_CLASSES[this.variant()];
    const size = this.variant() === 'link' ? '' : SIZE_CLASSES[this.size()];
    const width = this.fullWidth() ? 'w-full' : '';
    return [base, variant, size, width].filter(Boolean).join(' ');
  });

  protected handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
