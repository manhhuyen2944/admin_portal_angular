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
  selector: 'app-area-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="relative w-full flex flex-col" [style.height]="height()">
      <!-- Tooltip -->
      @if (hoveredPoint()) {
        <div
          class="absolute z-10 -top-2 transform -translate-x-1/2 pointer-events-none rounded-lg bg-foreground text-background px-2.5 py-1 text-xs font-semibold shadow-md transition-all duration-75"
          [style.left.%]="hoveredPoint()!.xPercent"
        >
          {{ hoveredPoint()!.label }}: {{ hoveredPoint()!.value }}
        </div>
      }

      <svg
        class="w-full h-full overflow-visible"
        viewBox="0 0 500 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient [id]="gradId()" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" [attr.stop-color]="color()" stop-opacity="0.45" />
            <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- Area fill -->
        @if (areaPath()) {
          <path [attr.d]="areaPath()" [attr.fill]="'url(#' + gradId() + ')'" />
        }

        <!-- Top outline stroke -->
        @if (linePath()) {
          <path
            [attr.d]="linePath()"
            fill="none"
            [attr.stroke]="color()"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        }

        <!-- Points -->
        @for (pt of points(); track pt.label) {
          <circle
            [attr.cx]="pt.x"
            [attr.cy]="pt.y"
            r="4"
            [attr.fill]="color()"
            class="cursor-pointer stroke-surface stroke-2 hover:r-6 transition-all"
            (mouseenter)="setHover(pt)"
            (mouseleave)="clearHover()"
          />
        }
      </svg>

      <!-- X-axis labels -->
      <div class="flex justify-between items-center pt-2 px-1 text-[11px] text-muted select-none">
        @for (pt of points(); track pt.label) {
          <span class="truncate">{{ pt.label }}</span>
        }
      </div>
    </div>
  `,
})
export class AreaChartComponent {
  data = input<ChartDataPoint[]>([]);
  color = input('var(--color-primary, #6366f1)');
  height = input('220px');

  protected readonly gradId = computed(() => `area-grad-${Math.random().toString(36).slice(2, 7)}`);
  protected hoveredPoint = signal<{ xPercent: number; label: string; value: number } | null>(null);

  protected readonly points = computed(() => {
    const list = this.data();
    if (!list.length) return [];

    const values = list.map(d => d.value);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 10);
    const range = max - min || 1;

    const width = 500;
    const height = 180;
    const padding = 20;

    const step = list.length > 1 ? (width - padding * 2) / (list.length - 1) : 0;

    return list.map((d, i) => {
      const x = padding + i * step;
      const y = height - ((d.value - min) / range) * (height - padding * 2) - padding;
      return {
        x,
        y,
        label: d.label,
        value: d.value,
        xPercent: (x / width) * 100,
      };
    });
  });

  protected readonly linePath = computed(() => {
    const pts = this.points();
    if (!pts.length) return '';
    return pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  });

  protected readonly areaPath = computed(() => {
    const pts = this.points();
    if (!pts.length) return '';
    const line = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${line} L ${last.x} 180 L ${first.x} 180 Z`;
  });

  protected setHover(pt: { xPercent: number; label: string; value: number }): void {
    this.hoveredPoint.set(pt);
  }

  protected clearHover(): void {
    this.hoveredPoint.set(null);
  }
}
