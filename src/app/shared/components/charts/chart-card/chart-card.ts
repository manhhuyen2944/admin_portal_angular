import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ChartCard — standard card container for dashboard analytics and charts.
 *
 * Usage:
 *   <app-chart-card title="Revenue Overview" subtitle="Last 30 days performance">
 *     <div slot="actions">
 *       <!-- Timeframe filter buttons -->
 *     </div>
 *     <app-line-chart [data]="revenueData" />
 *     <div slot="footer">
 *       <!-- Summary stats -->
 *     </div>
 *   </app-chart-card>
 */
@Component({
  selector: 'app-chart-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 class="text-base font-semibold text-foreground leading-snug">{{ title() }}</h3>
          @if (subtitle()) {
            <p class="text-xs text-muted mt-0.5">{{ subtitle() }}</p>
          }
        </div>
        <div class="shrink-0">
          <ng-content select="[chart-actions]" />
        </div>
      </div>

      <!-- Chart Content Body -->
      <div class="flex-1 w-full my-1">
        <ng-content />
      </div>

      <!-- Footer slot -->
      <div class="mt-4 pt-3 border-t border-border/60">
        <ng-content select="[chart-footer]" />
      </div>
    </div>
  `,
})
export class ChartCardComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>(undefined);
}
