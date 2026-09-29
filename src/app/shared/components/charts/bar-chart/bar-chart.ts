import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartDataPoint } from '../chart.types';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="relative w-full flex flex-col" [style.height]="height()">
      <!-- Tooltip -->
      @if (hoveredBar()) {
        <div
          class="absolute z-10 -top-2 transform -translate-x-1/2 pointer-events-none rounded-lg bg-foreground text-background px-2.5 py-1 text-xs font-semibold shadow-md transition-all duration-75"
          [style.left.%]="hoveredBar()!.xPercent"
        >
          {{ hoveredBar()!.label }}: {{ hoveredBar()!.value }}
        </div>
      }

      <svg
        class="w-full h-full overflow-visible"
        viewBox="0 0 500 200"
        preserveAspectRatio="none"
      >
        <!-- Horizontal grid lines -->
        @if (showGrid()) {
          <line x1="0" y1="40" x2="500" y2="40" stroke="currentColor" class="text-border/60" stroke-dasharray="4 4" />
          <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" class="text-border/60" stroke-dasharray="4 4" />
          <line x1="0" y1="160" x2="500" y2="160" stroke="currentColor" class="text-border/60" stroke-dasharray="4 4" />
        }

        <!-- Bars -->
        @for (b of bars(); track b.label) {
          <rect
            [attr.x]="b.x"
            [attr.y]="b.y"
            [attr.width]="b.width"
            [attr.height]="b.height"
            rx="4"
            [attr.fill]="color()"
            class="transition-opacity duration-150 cursor-pointer hover:opacity-80"
            (mouseenter)="setHover(b)"
            (mouseleave)="clearHover()"
          />
        }
      </svg>

      <!-- X-axis labels -->
      <div class="flex justify-between items-center pt-2 px-1 text-[11px] text-muted select-none">
        @for (b of bars(); track b.label) {
          <span class="truncate text-center" [style.width.%]="100 / bars().length">
            {{ b.label }}
          </span>
        }
      </div>
    </div>
  `,
})
export class BarChartComponent {
  data = input<ChartDataPoint[]>([]);
  color = input('var(--color-primary, #4f46e5)');
  showGrid = input(true);
  height = input('220px');

  protected hoveredBar = signal<{ xPercent: number; label: string; value: number } | null>(null);

  protected readonly bars = computed(() => {
    const list = this.data();
    if (!list.length) return [];

    const values = list.map(d => d.value);
    const max = Math.max(...values, 10);

    const totalWidth = 500;
    const chartHeight = 180;
    const padding = 15;

    const availableWidth = totalWidth - padding * 2;
    const slotWidth = availableWidth / list.length;
    const barWidth = Math.min(slotWidth * 0.6, 40);

    return list.map((d, i) => {
      const h = Math.max(4, (d.value / max) * (chartHeight - 30));
      const x = padding + i * slotWidth + (slotWidth - barWidth) / 2;
      const y = chartHeight - h;
      return {
        x,
        y,
        width: barWidth,
        height: h,
        label: d.label,
        value: d.value,
        xPercent: ((x + barWidth / 2) / totalWidth) * 100,
      };
    });
  });

  protected setHover(b: { xPercent: number; label: string; value: number }): void {
    this.hoveredBar.set(b);
  }

  protected clearHover(): void {
    this.hoveredBar.set(null);
  }
}
