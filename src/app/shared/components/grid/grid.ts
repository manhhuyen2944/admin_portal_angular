import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
export type ColStart = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
export type ColOrder = 1 | 2 | 3 | 4 | 5 | 6 | 'first' | 'last' | 'none';
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type GridAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type GridJustify = 'start' | 'center' | 'end' | 'between' | 'around';

const COLS_MAP: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const SM_COLS_MAP: Record<GridCols, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
  7: 'sm:grid-cols-7',
  8: 'sm:grid-cols-8',
  9: 'sm:grid-cols-9',
  10: 'sm:grid-cols-10',
  11: 'sm:grid-cols-11',
  12: 'sm:grid-cols-12',
};

const MD_COLS_MAP: Record<GridCols, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
  9: 'md:grid-cols-9',
  10: 'md:grid-cols-10',
  11: 'md:grid-cols-11',
  12: 'md:grid-cols-12',
};

const LG_COLS_MAP: Record<GridCols, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9',
  10: 'lg:grid-cols-10',
  11: 'lg:grid-cols-11',
  12: 'lg:grid-cols-12',
};

const XL_COLS_MAP: Record<GridCols, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
  7: 'xl:grid-cols-7',
  8: 'xl:grid-cols-8',
  9: 'xl:grid-cols-9',
  10: 'xl:grid-cols-10',
  11: 'xl:grid-cols-11',
  12: 'xl:grid-cols-12',
};

const GAP_MAP: Record<GridGap, string> = {
  none: 'gap-0',
  xs: 'gap-1.5 sm:gap-2',
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4 md:gap-6',
  lg: 'gap-4 sm:gap-6 md:gap-8',
  xl: 'gap-6 sm:gap-8 md:gap-10',
};

const GAP_X_MAP: Record<GridGap, string> = {
  none: 'gap-x-0',
  xs: 'gap-x-1.5 sm:gap-x-2',
  sm: 'gap-x-2 sm:gap-x-3',
  md: 'gap-x-3 sm:gap-x-4 md:gap-x-6',
  lg: 'gap-x-4 sm:gap-x-6 md:gap-x-8',
  xl: 'gap-x-6 sm:gap-x-8 md:gap-x-10',
};

const GAP_Y_MAP: Record<GridGap, string> = {
  none: 'gap-y-0',
  xs: 'gap-y-1.5 sm:gap-y-2',
  sm: 'gap-y-2 sm:gap-y-3',
  md: 'gap-y-3 sm:gap-y-4 md:gap-y-6',
  lg: 'gap-y-4 sm:gap-y-6 md:gap-y-8',
  xl: 'gap-y-6 sm:gap-y-8 md:gap-y-10',
};

const ALIGN_MAP: Record<GridAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const JUSTIFY_MAP: Record<GridJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

const SPAN_MAP: Record<ColSpan, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
  full: 'col-span-full',
};

const SM_SPAN_MAP: Record<ColSpan, string> = {
  1: 'sm:col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  4: 'sm:col-span-4',
  5: 'sm:col-span-5',
  6: 'sm:col-span-6',
  7: 'sm:col-span-7',
  8: 'sm:col-span-8',
  9: 'sm:col-span-9',
  10: 'sm:col-span-10',
  11: 'sm:col-span-11',
  12: 'sm:col-span-12',
  full: 'sm:col-span-full',
};

const MD_SPAN_MAP: Record<ColSpan, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
  full: 'md:col-span-full',
};

const LG_SPAN_MAP: Record<ColSpan, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
  full: 'lg:col-span-full',
};

const XL_SPAN_MAP: Record<ColSpan, string> = {
  1: 'xl:col-span-1',
  2: 'xl:col-span-2',
  3: 'xl:col-span-3',
  4: 'xl:col-span-4',
  5: 'xl:col-span-5',
  6: 'xl:col-span-6',
  7: 'xl:col-span-7',
  8: 'xl:col-span-8',
  9: 'xl:col-span-9',
  10: 'xl:col-span-10',
  11: 'xl:col-span-11',
  12: 'xl:col-span-12',
  full: 'xl:col-span-full',
};

const START_MAP: Record<ColStart, string> = {
  1: 'col-start-1',
  2: 'col-start-2',
  3: 'col-start-3',
  4: 'col-start-4',
  5: 'col-start-5',
  6: 'col-start-6',
  7: 'col-start-7',
  8: 'col-start-8',
  9: 'col-start-9',
  10: 'col-start-10',
  11: 'col-start-11',
  12: 'col-start-12',
  13: 'col-start-13',
  auto: 'col-start-auto',
};

const SM_START_MAP: Record<ColStart, string> = {
  1: 'sm:col-start-1',
  2: 'sm:col-start-2',
  3: 'sm:col-start-3',
  4: 'sm:col-start-4',
  5: 'sm:col-start-5',
  6: 'sm:col-start-6',
  7: 'sm:col-start-7',
  8: 'sm:col-start-8',
  9: 'sm:col-start-9',
  10: 'sm:col-start-10',
  11: 'sm:col-start-11',
  12: 'sm:col-start-12',
  13: 'sm:col-start-13',
  auto: 'sm:col-start-auto',
};

const MD_START_MAP: Record<ColStart, string> = {
  1: 'md:col-start-1',
  2: 'md:col-start-2',
  3: 'md:col-start-3',
  4: 'md:col-start-4',
  5: 'md:col-start-5',
  6: 'md:col-start-6',
  7: 'md:col-start-7',
  8: 'md:col-start-8',
  9: 'md:col-start-9',
  10: 'md:col-start-10',
  11: 'md:col-start-11',
  12: 'md:col-start-12',
  13: 'md:col-start-13',
  auto: 'md:col-start-auto',
};

const LG_START_MAP: Record<ColStart, string> = {
  1: 'lg:col-start-1',
  2: 'lg:col-start-2',
  3: 'lg:col-start-3',
  4: 'lg:col-start-4',
  5: 'lg:col-start-5',
  6: 'lg:col-start-6',
  7: 'lg:col-start-7',
  8: 'lg:col-start-8',
  9: 'lg:col-start-9',
  10: 'lg:col-start-10',
  11: 'lg:col-start-11',
  12: 'lg:col-start-12',
  13: 'lg:col-start-13',
  auto: 'lg:col-start-auto',
};

const ORDER_MAP: Record<ColOrder, string> = {
  1: 'order-1',
  2: 'order-2',
  3: 'order-3',
  4: 'order-4',
  5: 'order-5',
  6: 'order-6',
  first: 'order-first',
  last: 'order-last',
  none: 'order-none',
};

const SM_ORDER_MAP: Record<ColOrder, string> = {
  1: 'sm:order-1',
  2: 'sm:order-2',
  3: 'sm:order-3',
  4: 'sm:order-4',
  5: 'sm:order-5',
  6: 'sm:order-6',
  first: 'sm:order-first',
  last: 'sm:order-last',
  none: 'sm:order-none',
};

const MD_ORDER_MAP: Record<ColOrder, string> = {
  1: 'md:order-1',
  2: 'md:order-2',
  3: 'md:order-3',
  4: 'md:order-4',
  5: 'md:order-5',
  6: 'md:order-6',
  first: 'md:order-first',
  last: 'md:order-last',
  none: 'md:order-none',
};

const LG_ORDER_MAP: Record<ColOrder, string> = {
  1: 'lg:order-1',
  2: 'lg:order-2',
  3: 'lg:order-3',
  4: 'lg:order-4',
  5: 'lg:order-5',
  6: 'lg:order-6',
  first: 'lg:order-first',
  last: 'lg:order-last',
  none: 'lg:order-none',
};

/**
 * GridComponent — Responsive Grid Container with direct host styling.
 *
 * Usage:
 *   <!-- 12-column grid with responsive column spans -->
 *   <app-grid [cols]="12" gap="md">
 *     <app-grid-col [span]="12" [spanMd]="6">Left Column</app-grid-col>
 *     <app-grid-col [span]="12" [spanMd]="6">Right Column</app-grid-col>
 *   </app-grid>
 *
 *   <!-- Responsive column grid (e.g. 1 on mobile, 2 on tablet, 4 on desktop) -->
 *   <app-grid [cols]="1" [colsSm]="2" [colsMd]="3" [colsLg]="4" gap="md">
 *     <div>Card 1</div>
 *     <div>Card 2</div>
 *   </app-grid>
 */
@Component({
  selector: 'app-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'gridClasses()',
    '[style.grid-template-columns]': 'autoFitStyle()',
  },
  template: `<ng-content />`,
})
export class GridComponent {
  /** Number of default columns (mobile / base). Defaults to 12 for 12-col layout */
  cols = input<GridCols>(12);
  colsSm = input<GridCols | undefined>(undefined);
  colsMd = input<GridCols | undefined>(undefined);
  colsLg = input<GridCols | undefined>(undefined);
  colsXl = input<GridCols | undefined>(undefined);

  /** Gap size between items */
  gap = input<GridGap>('md');
  gapX = input<GridGap | undefined>(undefined);
  gapY = input<GridGap | undefined>(undefined);

  /** Items alignment */
  align = input<GridAlign>('stretch');

  /** Items horizontal justification */
  justify = input<GridJustify>('start');

  /** Enable auto-fit / auto-fill dynamic columns */
  autoFit = input(false);

  /** Min width for auto-fit columns (e.g. '260px') */
  minColWidth = input('260px');

  protected readonly autoFitStyle = computed(() => {
    if (this.autoFit()) {
      return `repeat(auto-fit, minmax(min(${this.minColWidth()}, 100%), 1fr))`;
    }
    return null;
  });

  protected readonly gridClasses = computed(() => {
    const gapClass = this.gapX() || this.gapY()
      ? `${this.gapX() ? GAP_X_MAP[this.gapX()!] : ''} ${this.gapY() ? GAP_Y_MAP[this.gapY()!] : ''}`.trim()
      : GAP_MAP[this.gap()];

    if (this.autoFit()) {
      return `grid w-full ${gapClass} ${ALIGN_MAP[this.align()]} ${JUSTIFY_MAP[this.justify()]}`;
    }

    const classes = [
      'grid w-full',
      COLS_MAP[this.cols()],
      this.colsSm() ? SM_COLS_MAP[this.colsSm()!] : '',
      this.colsMd() ? MD_COLS_MAP[this.colsMd()!] : '',
      this.colsLg() ? LG_COLS_MAP[this.colsLg()!] : '',
      this.colsXl() ? XL_COLS_MAP[this.colsXl()!] : '',
      gapClass,
      ALIGN_MAP[this.align()],
      JUSTIFY_MAP[this.justify()],
    ];

    return classes.filter(Boolean).join(' ');
  });
}

/**
 * GridColComponent — Direct responsive column child inside app-grid.
 * Defaults to span="12" (full-width stacked on mobile), scaling up responsively via spanSm, spanMd, spanLg.
 */
@Component({
  selector: 'app-grid-col',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'colClasses()',
  },
  template: `<ng-content />`,
})
export class GridColComponent {
  /** Column span on mobile (1..12 or 'full'). Defaults to 12 (full-width on mobile) */
  span = input<ColSpan>(12);
  spanSm = input<ColSpan | undefined>(undefined);
  spanMd = input<ColSpan | undefined>(undefined);
  spanLg = input<ColSpan | undefined>(undefined);
  spanXl = input<ColSpan | undefined>(undefined);

  /** Starting column (col-start) */
  start = input<ColStart | undefined>(undefined);
  startSm = input<ColStart | undefined>(undefined);
  startMd = input<ColStart | undefined>(undefined);
  startLg = input<ColStart | undefined>(undefined);

  /** Responsive order */
  order = input<ColOrder | undefined>(undefined);
  orderSm = input<ColOrder | undefined>(undefined);
  orderMd = input<ColOrder | undefined>(undefined);
  orderLg = input<ColOrder | undefined>(undefined);

  protected readonly colClasses = computed(() => {
    const classes = [
      'block min-w-0 w-full',
      SPAN_MAP[this.span()],
      this.spanSm() ? SM_SPAN_MAP[this.spanSm()!] : '',
      this.spanMd() ? MD_SPAN_MAP[this.spanMd()!] : '',
      this.spanLg() ? LG_SPAN_MAP[this.spanLg()!] : '',
      this.spanXl() ? XL_SPAN_MAP[this.spanXl()!] : '',
      this.start() ? START_MAP[this.start()!] : '',
      this.startSm() ? SM_START_MAP[this.startSm()!] : '',
      this.startMd() ? MD_START_MAP[this.startMd()!] : '',
      this.startLg() ? LG_START_MAP[this.startLg()!] : '',
      this.order() ? ORDER_MAP[this.order()!] : '',
      this.orderSm() ? SM_ORDER_MAP[this.orderSm()!] : '',
      this.orderMd() ? MD_ORDER_MAP[this.orderMd()!] : '',
      this.orderLg() ? LG_ORDER_MAP[this.orderLg()!] : '',
    ];
    return classes.filter(Boolean).join(' ');
  });
}
