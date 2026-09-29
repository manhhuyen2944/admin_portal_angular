import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type TagSize = 'sm' | 'md' | 'lg';

/**
 * Tag / Chip — removable label, filter chip, selection tag.
 *
 * Usage:
 *   <app-tag label="Angular" />
 *   <app-tag label="TypeScript" [removable]="true" (removed)="removeTag('TypeScript')" />
 *   <app-tag label="Active" variant="success" />
 */
@Component({
  selector: 'app-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium
             leading-none whitespace-nowrap transition-colors"
      [class]="variantClass()"
    >
      <ng-content select="[tag-icon]" />
      {{ label() }}
      @if (removable()) {
        <button
          type="button"
          class="inline-flex shrink-0 items-center justify-center rounded-full
                 hover:bg-black/10 transition-colors w-3.5 h-3.5"
          [attr.aria-label]="'Remove ' + label()"
          (click)="removed.emit()"
        >
          <app-icon name="x" size="xs" />
        </button>
      }
    </span>
  `,
})
export class TagComponent {
  label = input.required<string>();
  removable = input(false);
  variant = input<'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'>('default');

  removed = output<void>();

  protected variantClass(): string {
    const map: Record<string, string> = {
      default: 'bg-surface-raised text-foreground-secondary border-border',
      primary: 'bg-primary/10 text-primary border-primary/20',
      success: 'bg-success/10 text-success-dark border-success/20',
      warning: 'bg-warning/10 text-warning-dark border-warning/20',
      danger:  'bg-danger/10 text-danger-dark border-danger/20',
      info:    'bg-info/10 text-info-dark border-info/20',
    };
    return map[this.variant()] ?? map['default'];
  }
}
