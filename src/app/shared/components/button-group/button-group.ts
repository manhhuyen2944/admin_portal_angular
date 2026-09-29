import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, type IconSize } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';
import type { ButtonSize, ButtonVariant } from '../button/button';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupItem {
  label?: string;
  value: any;
  icon?: IconName;
  disabled?: boolean;
  badge?: string | number;
  ariaLabel?: string;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
};

const ICON_SIZE_MAP: Record<ButtonSize, IconSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

/**
 * ButtonGroupComponent — Flexible container for grouping buttons or segmented controls.
 *
 * Usage 1 — Projected Buttons (Toolbar / Action Group):
 *   <app-button-group variant="outline" size="sm">
 *     <app-button variant="outline" icon="copy">Copy</app-button>
 *     <app-button variant="outline" icon="download">Export</app-button>
 *     <app-button variant="outline" icon="share-2">Share</app-button>
 *   </app-button-group>
 *
 * Usage 2 — Data-Driven Segmented Control (Toggle selection):
 *   <app-button-group
 *     [items]="viewOptions"
 *     [(value)]="selectedView"
 *     variant="outline"
 *     size="sm"
 *   />
 */
@Component({
  selector: 'app-button-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  host: {
    '[class]': 'containerClasses()',
    '[attr.role]': 'items().length > 0 ? "radiogroup" : "group"',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-orientation]': 'orientation()',
  },
  template: `
    @if (items().length > 0) {
      @for (item of items(); track item.value; let isFirst = $first; let isLast = $last) {
        <button
          type="button"
          [disabled]="disabled() || item.disabled"
          [attr.aria-checked]="isSelected(item.value)"
          [attr.aria-label]="item.ariaLabel || item.label || null"
          [class]="itemClasses(item, isFirst, isLast)"
          (click)="handleItemClick(item)"
        >
          @if (item.icon) {
            <app-icon [name]="item.icon" [size]="iconSize()" />
          }
          @if (item.label) {
            <span>{{ item.label }}</span>
          }
          @if (item.badge !== undefined) {
            <span
              [class]="
                'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold ' +
                (isSelected(item.value)
                  ? 'bg-white/20 text-white'
                  : 'bg-muted/15 text-muted')
              "
            >
              {{ item.badge }}
            </span>
          }
        </button>
      }
    } @else {
      <ng-content />
    }
  `,
})
export class ButtonGroupComponent {
  /** Orientation of the buttons */
  orientation = input<ButtonGroupOrientation>('horizontal');

  /** Visual variant for child/rendered items */
  variant = input<ButtonVariant>('outline');

  /** Size of buttons */
  size = input<ButtonSize>('md');

  /** Whether buttons are seamlessly attached with shared borders */
  attached = input<boolean>(true);

  /** Stretch full width with equal-width buttons */
  fullWidth = input<boolean>(false);

  /** Disable all buttons */
  disabled = input<boolean>(false);

  /** Accessible label */
  ariaLabel = input<string>('Button group');

  /** Data-driven items for segmented selection */
  items = input<ButtonGroupItem[]>([]);

  /** Selected value for items mode */
  value = input<any>(undefined);

  /** Allow multiple selections (array of values) */
  multiple = input<boolean>(false);

  /** Emitted when selected value changes */
  valueChange = output<any>();

  /** Emitted when an item is clicked */
  itemClick = output<ButtonGroupItem>();

  protected readonly iconSize = computed(() => ICON_SIZE_MAP[this.size()]);

  protected readonly containerClasses = computed(() => {
    const isHoriz = this.orientation() === 'horizontal';
    const isAttached = this.attached();
    const isFull = this.fullWidth();

    const base = [
      isHoriz ? 'inline-flex flex-row' : 'inline-flex flex-col',
      isFull ? 'w-full' : '',
    ];

    if (isAttached) {
      if (isHoriz) {
        base.push(
          // Attached styling for projected buttons or direct buttons
          '[&>*:first-child_button]:rounded-r-none [&>button:first-child]:rounded-r-none',
          '[&>*:not(:first-child):not(:last-child)_button]:rounded-none [&>button:not(:first-child):not(:last-child)]:rounded-none',
          '[&>*:last-child_button]:rounded-l-none [&>button:last-child]:rounded-l-none',
          '[&>*:not(:first-child)]:!-ml-px [&>button:not(:first-child)]:!-ml-px',
          '[&>*:hover]:z-10 [&>button:hover]:z-10',
          '[&>*:focus-within]:z-20 [&>button:focus]:z-20',
        );
      } else {
        base.push(
          '[&>*:first-child_button]:rounded-b-none [&>button:first-child]:rounded-b-none',
          '[&>*:not(:first-child):not(:last-child)_button]:rounded-none [&>button:not(:first-child):not(:last-child)]:rounded-none',
          '[&>*:last-child_button]:rounded-t-none [&>button:last-child]:rounded-t-none',
          '[&>*:not(:first-child)]:!-mt-px [&>button:not(:first-child)]:!-mt-px',
          '[&>*:hover]:z-10 [&>button:hover]:z-10',
          '[&>*:focus-within]:z-20 [&>button:focus]:z-20',
        );
      }
    } else {
      base.push(isHoriz ? 'gap-1.5' : 'gap-1.5');
    }

    if (isFull) {
      base.push('[&>*]:flex-1 [&>button]:flex-1');
    }

    return base.filter(Boolean).join(' ');
  });

  protected isSelected(itemValue: any): boolean {
    const current = this.value();
    if (this.multiple() && Array.isArray(current)) {
      return current.includes(itemValue);
    }
    return current === itemValue;
  }

  protected itemClasses(
    item: ButtonGroupItem,
    isFirst: boolean,
    isLast: boolean,
  ): string {
    const isHoriz = this.orientation() === 'horizontal';
    const isAttached = this.attached();
    const active = this.isSelected(item.value);

    const base = [
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      SIZE_CLASSES[this.size()],
      this.fullWidth() ? 'w-full flex-1' : '',
    ];

    // Border radius based on position
    if (isAttached) {
      if (isHoriz) {
        if (isFirst && isLast) {
          base.push('rounded-md border');
        } else if (isFirst) {
          base.push('rounded-l-md rounded-r-none border');
        } else if (isLast) {
          base.push('rounded-r-md rounded-l-none border -ml-px');
        } else {
          base.push('rounded-none border -ml-px');
        }
      } else {
        if (isFirst && isLast) {
          base.push('rounded-md border');
        } else if (isFirst) {
          base.push('rounded-t-md rounded-b-none border');
        } else if (isLast) {
          base.push('rounded-b-md rounded-t-none border -mt-px');
        } else {
          base.push('rounded-none border -mt-px');
        }
      }
    } else {
      base.push('rounded-md border');
    }

    // Colors / Active state
    if (active) {
      base.push('bg-primary text-white border-primary z-10 shadow-xs font-semibold');
    } else {
      base.push(
        'border-border bg-surface text-foreground hover:bg-surface-raised hover:z-10',
      );
    }

    return base.filter(Boolean).join(' ');
  }

  protected handleItemClick(item: ButtonGroupItem): void {
    if (this.disabled() || item.disabled) return;

    this.itemClick.emit(item);

    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? [...this.value()] : [];
      const idx = current.indexOf(item.value);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(item.value);
      }
      this.valueChange.emit(current);
    } else {
      this.valueChange.emit(item.value);
    }
  }
}
