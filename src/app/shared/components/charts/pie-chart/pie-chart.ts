import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartDataPoint } from '../chart.types';

const DEFAULT_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose/Red
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
];

interface SliceSegment {
  label: string;
  value: number;
  color: string;
  dashArray: string;
  dashOffset: number;
  percentage: number;
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col xl:flex-row items-center justify-center gap-4 sm:gap-6 p-2 w-full max-w-full overflow-hidden">
      <!-- Circular SVG -->
      <div
        class="relative flex items-center justify-center shrink-0 w-36 h-36 sm:w-44 sm:h-44"
        [style.maxWidth.px]="size()"
        [style.maxHeight.px]="size()"
      >
        <svg
          class="w-full h-full -rotate-90 transform"
          viewBox="0 0 100 100"
        >
          <!-- Background circle track -->
          <circle
            cx="50"
            cy="50"
            [attr.r]="radius()"
            fill="transparent"
            stroke="currentColor"
            class="text-border/40"
            [attr.stroke-width]="strokeWidth()"
          />

          <!-- Segments -->
          @for (s of segments(); track s.label; let i = $index) {
            <circle
              cx="50"
              cy="50"
              [attr.r]="radius()"
              fill="transparent"
              [attr.stroke]="s.color"
              [attr.stroke-width]="strokeWidth()"
              [attr.stroke-dasharray]="s.dashArray"
              [attr.stroke-dashoffset]="s.dashOffset"
              class="transition-all duration-300 cursor-pointer hover:opacity-80"
              (mouseenter)="hoveredIndex.set(i)"
              (mouseleave)="hoveredIndex.set(null)"
            />
          }
        </svg>

        <!-- Donut center content -->
        @if (donut()) {
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
            @if (activeSlice()) {
              <span class="text-[11px] sm:text-xs text-muted truncate max-w-[80%]">{{ activeSlice()!.label }}</span>
              <span class="text-sm sm:text-base font-bold text-foreground leading-tight">{{ activeSlice()!.value }}</span>
              <span class="text-[10px] text-muted">{{ activeSlice()!.percentage }}%</span>
            } @else {
              <span class="text-[11px] sm:text-xs text-muted">Total</span>
              <span class="text-base sm:text-lg font-bold text-foreground leading-tight">{{ total() }}</span>
            }
          </div>
        }
      </div>

      <!-- Legend items: 2-column grid on mobile/tablet, vertical column on large screens -->
      <div class="grid grid-cols-2 xl:flex xl:flex-col gap-1.5 sm:gap-2 w-full xl:w-auto xl:min-w-32">
        @for (s of segments(); track s.label; let i = $index) {
          <div
            class="flex items-center justify-between gap-2 sm:gap-3 text-xs cursor-pointer p-1.5 sm:p-1 rounded-lg transition-colors hover:bg-surface-raised min-w-0"
            [class.font-semibold]="hoveredIndex() === i"
            (mouseenter)="hoveredIndex.set(i)"
            (mouseleave)="hoveredIndex.set(null)"
          >
            <div class="flex items-center gap-2 min-w-0 flex-1 truncate">
              <span class="h-2.5 w-2.5 rounded-full shrink-0" [style.backgroundColor]="s.color"></span>
              <span class="truncate text-foreground">{{ s.label }}</span>
            </div>
            <span class="text-muted font-mono text-[11px] shrink-0">{{ s.percentage }}%</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class PieChartComponent {
  data = input<ChartDataPoint[]>([]);
  colors = input<string[]>(DEFAULT_COLORS);
  donut = input(true);
  size = input(180);

  protected hoveredIndex = signal<number | null>(null);

  protected readonly radius = computed(() => (this.donut() ? 38 : 25));
  protected readonly strokeWidth = computed(() => (this.donut() ? 18 : 50));
  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());

  protected readonly total = computed(() => {
    return this.data().reduce((acc, d) => acc + d.value, 0);
  });

  protected readonly segments = computed<SliceSegment[]>(() => {
    const list = this.data();
    const tot = this.total();
    if (!list.length || tot === 0) return [];

    const C = this.circumference();
    const colorPalette = this.colors();
    let accumulatedOffset = 0;

    return list.map((item, index) => {
      const pct = Math.round((item.value / tot) * 100);
      const strokeLength = (item.value / tot) * C;
      const dashArray = `${strokeLength} ${C - strokeLength}`;
      const dashOffset = -accumulatedOffset;
      accumulatedOffset += strokeLength;

      return {
        label: item.label,
        value: item.value,
        color: colorPalette[index % colorPalette.length],
        dashArray,
        dashOffset,
        percentage: pct,
      };
    });
  });

  protected readonly activeSlice = computed(() => {
    const idx = this.hoveredIndex();
    if (idx === null) return null;
    return this.segments()[idx] ?? null;
  });
}
