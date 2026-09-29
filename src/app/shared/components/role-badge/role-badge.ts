import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AppRole =
  | 'admin'
  | 'super-admin'
  | 'manager'
  | 'editor'
  | 'viewer'
  | 'user'
  | 'moderator'
  | 'support'
  | 'billing'
  | 'guest';

interface RoleConfig { label: string; classes: string; }

/** Single source of truth for role → label + color. */
export const ROLE_MAP: Record<AppRole, RoleConfig> = {
  'super-admin': { label: 'Super Admin', classes: 'bg-violet-100 text-violet-800 border border-violet-200' },
  'admin':       { label: 'Admin',       classes: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
  'manager':     { label: 'Manager',     classes: 'bg-blue-100 text-blue-800 border border-blue-200' },
  'editor':      { label: 'Editor',      classes: 'bg-cyan-100 text-cyan-800 border border-cyan-200' },
  'moderator':   { label: 'Moderator',   classes: 'bg-teal-100 text-teal-800 border border-teal-200' },
  'support':     { label: 'Support',     classes: 'bg-amber-100 text-amber-800 border border-amber-200' },
  'billing':     { label: 'Billing',     classes: 'bg-orange-100 text-orange-800 border border-orange-200' },
  'viewer':      { label: 'Viewer',      classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
  'user':        { label: 'User',        classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
  'guest':       { label: 'Guest',       classes: 'bg-slate-50 text-muted border border-border' },
};

/**
 * RoleBadge — role → label/color badge. Single source of truth.
 * Never duplicate the role→color mapping in templates.
 *
 * Usage:
 *   <app-role-badge role="admin" />
 *   <app-role-badge role="manager" label="Team Lead" />
 */
@Component({
  selector: 'app-role-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes()">{{ displayLabel() }}</span>
  `,
})
export class RoleBadgeComponent {
  role = input.required<AppRole>();
  label = input<string | undefined>(undefined);

  protected readonly config = computed(() => ROLE_MAP[this.role()]);
  protected readonly displayLabel = computed(() => this.label() ?? this.config().label);
  protected readonly classes = computed(() =>
    `inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full leading-none whitespace-nowrap ${this.config().classes}`
  );
}
