import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';
import { LoadingShimmerComponent } from '../loading-shimmer/loading-shimmer';

export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * StatCard — metric display card with value, trend, and icon.
 * The canonical component for dashboard KPI widgets.
 *
 * Usage:
 *   <app-stat-card
 *     title="Total Users"
 *     value="12,453"
 *     [trend]="8.2"
 *     trendLabel="vs last month"
 *     icon="users"
 *   />
 *
 *   <!-- Loading state: -->
 *   <app-stat-card [loading]="true" title="Revenue" />
 *
 * Responsive: full width by default, use grid in page layout.
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, LoadingShimmerComponent],
  template: `
    <div class="rounded-card border border-border bg-surface p-6 flex flex-col gap-4 shadow-sm">
      @if (loading()) {
        <div class="space-y-3">
          <app-loading-shimmer variant="text" [lines]="1" />
          <app-loading-shimmer variant="title" />
          <app-loading-shimmer variant="text" [lines]="1" />
        </div>
      } @else {
        <!-- Header: title + icon -->
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-medium text-foreground-secondary">{{ title() }}</p>
          @if (icon()) {
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                 [class]="iconBgClass()">
              <app-icon [name]="icon()!" size="md" class="text-white" />
            </div>
          }
        </div>

        <!-- Value -->
        <div class="flex items-end gap-3 flex-wrap">
          <span class="text-3xl font-bold text-foreground tabular-nums leading-none">
            {{ value() }}
          </span>

          <!-- Trend badge -->
          @if (trend() !== undefined) {
            <span class="inline-flex items-center gap-1 text-sm font-medium leading-none"
                  [class]="trendClasses()">
              <app-icon [name]="trendIcon()" size="xs" />
              {{ trendAbs() }}%
            </span>
          }
        </div>

        <!-- Trend label -->
        @if (trendLabel()) {
          <p class="text-xs text-muted">{{ trendLabel() }}</p>
        }

        <!-- Optional description -->
        @if (description()) {
          <p class="text-sm text-foreground-secondary">{{ description() }}</p>
        }
      }
    </div>
  `,
})
export class StatCardComponent {
  title = input.required<string>();
  value = input<string | number>('—');
  /** Percent change. Positive = up, negative = down, 0 = neutral. */
  trend = input<number | undefined>(undefined);
  trendLabel = input<string | undefined>(undefined);
  description = input<string | undefined>(undefined);
  icon = input<IconName | undefined>(undefined);
  loading = input(false);
  /** Override auto-direction from trend sign. */
  trendDirection = input<TrendDirection | undefined>(undefined);

  protected readonly direction = computed<TrendDirection>(() => {
    if (this.trendDirection()) return this.trendDirection()!;
    const t = this.trend() ?? 0;
    if (t > 0) return 'up';
    if (t < 0) return 'down';
    return 'neutral';
  });

  protected readonly trendAbs = computed(() => Math.abs(this.trend() ?? 0).toFixed(1));

  protected readonly trendIcon = computed<IconName>(() => {
    const d = this.direction();
    if (d === 'up') return 'trending-up';
    if (d === 'down') return 'trending-down';
    return 'minus' as IconName;
  });

  protected readonly trendClasses = computed(() => {
    const d = this.direction();
    if (d === 'up') return 'text-success-dark';
    if (d === 'down') return 'text-danger';
    return 'text-muted';
  });

  protected readonly iconBgClass = computed(() => {
    // Rotate through primary, success, info based on title hash
    const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning'];
    let h = 0;
    for (const c of this.title()) h = c.charCodeAt(0) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  });
}
