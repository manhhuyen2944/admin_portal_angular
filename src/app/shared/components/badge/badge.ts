import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

export type BadgeSize = 'sm' | 'md';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default:   'bg-surface-raised text-foreground-secondary border border-border',
  primary:   'bg-primary/10 text-primary border border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
  success:   'bg-success/10 text-success-dark border border-success/20',
  warning:   'bg-warning/10 text-warning-dark border border-warning/20',
  danger:    'bg-danger/10 text-danger-dark border border-danger/20',
  info:      'bg-info/10 text-info-dark border border-info/20',
  outline:   'bg-transparent text-foreground border border-border',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

/**
 * Badge — generic label badge for counts, tags, and statuses.
 *
 * Usage:
 *   <app-badge>New</app-badge>
 *   <app-badge variant="success">Active</app-badge>
 *   <app-badge variant="danger" size="sm">Error</app-badge>
 *
 * For status-specific badges, prefer StatusBadge or RoleBadge.
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes()">
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  variant = input<BadgeVariant>('default');
  size = input<BadgeSize>('md');

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-full leading-none whitespace-nowrap';
    return [base, VARIANT_CLASSES[this.variant()], SIZE_CLASSES[this.size()]]
      .join(' ');
  });
}
