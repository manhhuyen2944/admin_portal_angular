import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Status values for the app. Add new statuses here — the mapping lives ONCE.
 * Do not duplicate this mapping anywhere else in the codebase.
 */
export type AppStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'error'
  | 'draft'
  | 'published'
  | 'archived'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'unknown';

interface StatusConfig {
  label: string;
  classes: string;
}

/** Single source of truth for status → label + color. */
export const STATUS_MAP: Record<AppStatus, StatusConfig> = {
  active:     { label: 'Active',     classes: 'bg-success/10 text-success-dark border border-success/20' },
  inactive:   { label: 'Inactive',   classes: 'bg-surface-raised text-foreground-secondary border border-border' },
  pending:    { label: 'Pending',    classes: 'bg-warning/10 text-warning-dark border border-warning/20' },
  suspended:  { label: 'Suspended',  classes: 'bg-danger/10 text-danger-dark border border-danger/20' },
  error:      { label: 'Error',      classes: 'bg-danger/10 text-danger-dark border border-danger/20' },
  draft:      { label: 'Draft',      classes: 'bg-secondary/10 text-secondary border border-secondary/20' },
  published:  { label: 'Published',  classes: 'bg-success/10 text-success-dark border border-success/20' },
  archived:   { label: 'Archived',   classes: 'bg-surface-raised text-muted border border-border' },
  approved:   { label: 'Approved',   classes: 'bg-success/10 text-success-dark border border-success/20' },
  rejected:   { label: 'Rejected',   classes: 'bg-danger/10 text-danger-dark border border-danger/20' },
  processing: { label: 'Processing', classes: 'bg-info/10 text-info-dark border border-info/20' },
  completed:  { label: 'Completed',  classes: 'bg-success/10 text-success-dark border border-success/20' },
  cancelled:  { label: 'Cancelled',  classes: 'bg-surface-raised text-muted border border-border' },
  expired:    { label: 'Expired',    classes: 'bg-warning/10 text-warning-dark border border-warning/20' },
  unknown:    { label: 'Unknown',    classes: 'bg-surface-raised text-muted border border-border' },
};

/**
 * StatusBadge — displays a status with the correct color from the single STATUS_MAP.
 * The mapping lives here; do NOT replicate it in templates or feature components.
 *
 * Usage:
 *   <app-status-badge status="active" />
 *   <app-status-badge status="pending" />
 *   <!-- Custom label override: -->
 *   <app-status-badge status="active" label="Enabled" />
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes()">
      {{ displayLabel() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  status = input.required<AppStatus>();
  /** Override the default label from STATUS_MAP. */
  label = input<string | undefined>(undefined);

  protected readonly config = computed(() => STATUS_MAP[this.status()]);
  protected readonly displayLabel = computed(() => this.label() ?? this.config().label);
  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full leading-none whitespace-nowrap';
    return `${base} ${this.config().classes}`;
  });
}
