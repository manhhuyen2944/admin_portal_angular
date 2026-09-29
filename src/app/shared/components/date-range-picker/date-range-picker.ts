import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';
import { IconButtonComponent } from '../icon-button/icon-button';

export interface DateRangeValue {
  start: string;
  end: string;
}

export interface DateRangePreset {
  label: string;
  getRange: () => { start: Date; end: Date };
}

export interface RangeCalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  isoString: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export type CalendarViewMode = 'day' | 'month' | 'year';

/**
 * DateRangePicker — Dedicated date interval selector with quick presets and calendar range selection.
 *
 * Usage:
 *   <app-date-range-picker [(ngModel)]="range" />
 *   <app-date-range-picker [(start)]="startDate" [(end)]="endDate" />
 */
@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, IconButtonComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full">
      <!-- Trigger Input Bar -->
      <button
        type="button"
        [class]="triggerClasses()"
        [disabled]="disabled()"
        (click)="toggleOpen()"
        aria-haspopup="dialog"
        [attr.aria-expanded]="isOpen()"
      >
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <app-icon name="calendar" size="xs" />
          </div>

          <div class="flex items-center gap-2 min-w-0 flex-1 text-xs sm:text-sm font-medium">
            <span class="truncate" [class.text-muted]="!internalStart()">
              {{ formatDisplay(internalStart()) || 'Start date' }}
            </span>
            <app-icon name="arrow-right" size="xs" class="text-muted shrink-0" />
            <span class="truncate" [class.text-muted]="!internalEnd()">
              {{ formatDisplay(internalEnd()) || 'End date' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0 ml-2">
          @if ((internalStart() || internalEnd()) && !disabled()) {
            <span
              role="button"
              tabindex="0"
              class="p-1 rounded-md hover:bg-surface-raised text-muted hover:text-foreground transition-colors cursor-pointer"
              title="Clear date range"
              (click)="clearRange($event)"
            >
              <app-icon name="x" size="xs" />
            </span>
          }
          <app-icon
            name="chevron-down"
            size="xs"
            class="text-muted transition-transform duration-200"
            [class.rotate-180]="isOpen()"
          />
        </div>
      </button>

      <!-- Calendar Range Popup -->
      @if (isOpen()) {
        <div
          class="absolute left-0 mt-2 z-[var(--z-dropdown,40)] rounded-2xl border border-border bg-surface shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 flex flex-col md:flex-row overflow-hidden max-w-[95vw] sm:max-w-none"
          role="dialog"
          aria-label="Date range selector"
          (click)="$event.stopPropagation()"
        >
          <!-- Quick Filter Presets (Left sidebar on desktop, top bar on mobile) -->
          <div class="w-full md:w-44 p-3 border-b md:border-b-0 md:border-r border-border bg-surface-raised/40 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
            <p class="hidden md:block text-[10px] font-bold text-muted uppercase tracking-wider px-2 py-1 mb-1">
              Quick Presets
            </p>
            @for (preset of presets; track preset.label) {
              <button
                type="button"
                class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors whitespace-nowrap cursor-pointer hover:bg-surface-raised hover:text-foreground text-muted"
                (click)="applyPreset(preset)"
              >
                {{ preset.label }}
              </button>
            }
          </div>

          <!-- Calendar View -->
          <div class="p-4 w-full sm:w-[320px]">
            <!-- Calendar Navigation Header -->
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
              <app-icon-button
                name="chevron-left"
                label="Previous"
                size="xs"
                variant="ghost"
                (click)="handlePrevNav($event)"
              />

              @switch (viewMode()) {
                @case ('day') {
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="px-2 py-1 rounded-lg text-xs font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                      title="Click to select month"
                      (click)="viewMode.set('month')"
                    >
                      <span>{{ currentMonthName() }}</span>
                      <app-icon name="chevron-down" size="xs" class="text-muted" />
                    </button>

                    <button
                      type="button"
                      class="px-2 py-1 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer flex items-center gap-1"
                      title="Click to select year"
                      (click)="viewMode.set('year')"
                    >
                      <span>{{ viewYear() }}</span>
                      <app-icon name="chevron-down" size="xs" class="text-muted" />
                    </button>
                  </div>
                }
                @case ('month') {
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    (click)="viewMode.set('year')"
                  >
                    <span>Select Month &bull; {{ viewYear() }}</span>
                  </button>
                }
                @case ('year') {
                  <div class="text-xs font-bold text-foreground">
                    <span>{{ decadeStart() }} – {{ decadeStart() + 11 }}</span>
                  </div>
                }
              }

              <app-icon-button
                name="chevron-right"
                label="Next"
                size="xs"
                variant="ghost"
                (click)="handleNextNav($event)"
              />
            </div>

            <!-- 1. Day View -->
            @if (viewMode() === 'day') {
              <!-- Weekday Headers -->
              <div class="grid grid-cols-7 gap-1 mb-2 text-center">
                @for (day of weekdays; track day) {
                  <span class="text-[10px] font-semibold text-muted uppercase tracking-wider py-0.5">
                    {{ day }}
                  </span>
                }
              </div>

              <!-- Calendar Days Grid -->
              <div class="grid grid-cols-7 gap-1">
                @for (day of calendarDays(); track day.isoString) {
                  <button
                    type="button"
                    [disabled]="day.isDisabled"
                    [class]="dayClasses(day)"
                    (click)="handleDayClick(day)"
                  >
                    {{ day.dayNumber }}
                  </button>
                }
              </div>
            }

            <!-- 2. Month View Grid -->
            @if (viewMode() === 'month') {
              <div class="grid grid-cols-3 gap-2 py-1">
                @for (m of monthsShort; track $index) {
                  <button
                    type="button"
                    class="h-11 text-xs font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    [class]="viewMonth() === $index ? 'bg-primary text-white font-bold shadow-md shadow-primary/30 scale-105' : 'hover:bg-primary/10 hover:text-primary text-foreground bg-surface-raised/60'"
                    (click)="selectMonth($index, $event)"
                  >
                    {{ m }}
                  </button>
                }
              </div>
            }

            <!-- 3. Year View Grid (Decade) -->
            @if (viewMode() === 'year') {
              <div class="grid grid-cols-3 gap-2 py-1">
                @for (y of decadeYears(); track y) {
                  <button
                    type="button"
                    class="h-11 text-xs font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    [class]="viewYear() === y ? 'bg-primary text-white font-bold shadow-md shadow-primary/30 scale-105' : 'hover:bg-primary/10 hover:text-primary text-foreground bg-surface-raised/60'"
                    (click)="selectYear(y, $event)"
                  >
                    {{ y }}
                  </button>
                }
              </div>
            }

            <!-- Selection helper & actions -->
            <div class="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs">
              @if (viewMode() !== 'day') {
                <button
                  type="button"
                  class="font-medium text-primary hover:underline transition-colors cursor-pointer"
                  (click)="viewMode.set('day')"
                >
                  &larr; Back to Days
                </button>
              } @else {
                <span class="text-[11px] text-muted">
                  @if (!tempStart()) {
                    Click to select start date
                  } @else if (!tempEnd()) {
                    Click to select end date
                  } @else {
                    Range selected
                  }
                </span>
              }

              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  class="px-2 py-1 text-[11px] text-muted hover:text-foreground transition-colors cursor-pointer"
                  (click)="cancelSelection()"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-primary text-white shadow-xs hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50"
                  [disabled]="!tempStart()"
                  (click)="applySelection()"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DateRangePickerComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

  start = model<string>('');
  end = model<string>('');
  disabled = input(false);
  hasError = input(false);

  protected readonly isOpen = signal(false);
  protected readonly viewMode = signal<CalendarViewMode>('day');
  protected readonly viewMonth = signal(new Date().getMonth());
  protected readonly viewYear = signal(new Date().getFullYear());

  protected readonly monthsShort = MONTHS_SHORT;

  protected readonly decadeStart = computed(() => {
    return Math.floor(this.viewYear() / 12) * 12;
  });

  protected readonly decadeYears = computed(() => {
    const start = this.decadeStart();
    return Array.from({ length: 12 }, (_, i) => start + i);
  });

  protected readonly tempStart = signal<string>('');
  protected readonly tempEnd = signal<string>('');

  protected readonly internalStart = computed(() => this.tempStart() || this.start());
  protected readonly internalEnd = computed(() => this.tempEnd() || this.end());

  protected readonly weekdays = WEEKDAY_NAMES;

  protected readonly currentMonthName = computed(() => MONTH_NAMES[this.viewMonth()]);

  protected readonly presets: DateRangePreset[] = [
    {
      label: 'Today',
      getRange: () => {
        const now = new Date();
        return { start: now, end: now };
      },
    },
    {
      label: 'Yesterday',
      getRange: () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return { start: d, end: d };
      },
    },
    {
      label: 'Last 7 Days',
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        return { start, end };
      },
    },
    {
      label: 'Last 30 Days',
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        return { start, end };
      },
    },
    {
      label: 'This Month',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      },
    },
    {
      label: 'Last Month',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start, end };
      },
    },
  ];

  protected readonly triggerClasses = computed(() => {
    const base = [
      'flex items-center justify-between w-full h-10 px-3 py-1.5 rounded-xl border bg-surface text-foreground',
      'shadow-xs cursor-pointer transition-all duration-150',
      'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ');
    const border = this.hasError() ? 'border-danger ring-1 ring-danger/20' : 'border-border';
    const openState = this.isOpen() ? 'border-primary ring-2 ring-primary/20' : '';
    return `${base} ${border} ${openState}`;
  });

  protected readonly calendarDays = computed<RangeCalendarDay[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const todayStr = this.toIso(new Date());

    const s = this.tempStart() || this.start();
    const e = this.tempEnd() || this.end();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: RangeCalendarDay[] = [];

    // Trailing days from prev month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const date = new Date(year, month - 1, dayNum);
      const iso = this.toIso(date);
      days.push({
        date,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: iso === todayStr,
        isStart: iso === s,
        isEnd: iso === e,
        isInRange: Boolean(s && e && iso > s && iso < e),
        isDisabled: false,
        isoString: iso,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = this.toIso(date);
      days.push({
        date,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: iso === todayStr,
        isStart: iso === s,
        isEnd: iso === e,
        isInRange: Boolean(s && e && iso > s && iso < e),
        isDisabled: false,
        isoString: iso,
      });
    }

    // Leading days for next month
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const date = new Date(year, month + 1, n);
      const iso = this.toIso(date);
      days.push({
        date,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: iso === todayStr,
        isStart: iso === s,
        isEnd: iso === e,
        isInRange: Boolean(s && e && iso > s && iso < e),
        isDisabled: false,
        isoString: iso,
      });
    }

    return days;
  });

  protected dayClasses(day: RangeCalendarDay): string {
    const base = 'h-8 w-8 text-xs font-medium transition-colors flex items-center justify-center cursor-pointer';

    if (day.isStart && day.isEnd) {
      return `${base} rounded-lg bg-primary text-white font-bold shadow-xs`;
    }
    if (day.isStart) {
      return `${base} rounded-l-lg bg-primary text-white font-bold shadow-xs`;
    }
    if (day.isEnd) {
      return `${base} rounded-r-lg bg-primary text-white font-bold shadow-xs`;
    }
    if (day.isInRange) {
      return `${base} bg-primary/15 text-primary font-semibold rounded-none`;
    }
    if (day.isToday) {
      return `${base} rounded-lg border border-primary text-primary font-bold hover:bg-primary/10`;
    }
    if (!day.isCurrentMonth) {
      return `${base} rounded-lg text-muted/50 hover:bg-surface-raised`;
    }
    return `${base} rounded-lg text-foreground hover:bg-surface-raised`;
  }

  toggleOpen(): void {
    if (this.disabled()) return;
    if (!this.isOpen()) {
      this.viewMode.set('day');
      this.tempStart.set(this.start());
      this.tempEnd.set(this.end());
      if (this.start()) {
        const d = new Date(this.start());
        if (!isNaN(d.getTime())) {
          this.viewMonth.set(d.getMonth());
          this.viewYear.set(d.getFullYear());
        }
      }
    } else {
      this.viewMode.set('day');
    }
    this.isOpen.update((v) => !v);
  }

  handleDayClick(day: RangeCalendarDay): void {
    const clicked = day.isoString;
    const curStart = this.tempStart();
    const curEnd = this.tempEnd();

    if (!curStart || (curStart && curEnd)) {
      // Start fresh selection
      this.tempStart.set(clicked);
      this.tempEnd.set('');
    } else {
      // Pick end date
      if (clicked < curStart) {
        this.tempEnd.set(curStart);
        this.tempStart.set(clicked);
      } else {
        this.tempEnd.set(clicked);
      }
    }
  }

  applyPreset(preset: DateRangePreset): void {
    const range = preset.getRange();
    const s = this.toIso(range.start);
    const e = this.toIso(range.end);
    this.tempStart.set(s);
    this.tempEnd.set(e);
    this.applySelection();
  }

  applySelection(): void {
    const s = this.tempStart();
    let e = this.tempEnd();
    if (s && !e) {
      e = s; // Single day interval if only start picked
    }
    this.start.set(s);
    this.end.set(e);
    this.notifyChange({ start: s, end: e });
    this.isOpen.set(false);
    this.viewMode.set('day');
  }

  cancelSelection(): void {
    this.tempStart.set(this.start());
    this.tempEnd.set(this.end());
    this.isOpen.set(false);
    this.viewMode.set('day');
  }

  clearRange(event: MouseEvent): void {
    event.stopPropagation();
    this.start.set('');
    this.end.set('');
    this.tempStart.set('');
    this.tempEnd.set('');
    this.notifyChange({ start: '', end: '' });
  }

  protected handlePrevNav(event: MouseEvent): void {
    event.stopPropagation();
    switch (this.viewMode()) {
      case 'year':
        this.viewYear.update((y) => y - 12);
        break;
      case 'month':
        this.viewYear.update((y) => y - 1);
        break;
      default: {
        let m = this.viewMonth() - 1;
        let y = this.viewYear();
        if (m < 0) {
          m = 11;
          y--;
        }
        this.viewMonth.set(m);
        this.viewYear.set(y);
        break;
      }
    }
  }

  protected handleNextNav(event: MouseEvent): void {
    event.stopPropagation();
    switch (this.viewMode()) {
      case 'year':
        this.viewYear.update((y) => y + 12);
        break;
      case 'month':
        this.viewYear.update((y) => y + 1);
        break;
      default: {
        let m = this.viewMonth() + 1;
        let y = this.viewYear();
        if (m > 11) {
          m = 0;
          y++;
        }
        this.viewMonth.set(m);
        this.viewYear.set(y);
        break;
      }
    }
  }

  protected selectMonth(monthIndex: number, event: MouseEvent): void {
    event.stopPropagation();
    this.viewMonth.set(monthIndex);
    this.viewMode.set('day');
  }

  protected selectYear(year: number, event: MouseEvent): void {
    event.stopPropagation();
    this.viewYear.set(year);
    this.viewMode.set('month');
  }

  protected formatDisplay(iso: string): string {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const mShort = MONTH_NAMES[monthIdx]?.substring(0, 3) ?? parts[1];
      return `${mShort} ${day}, ${year}`;
    }
    return iso;
  }

  private toIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.viewMode.set('day');
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
    this.viewMode.set('day');
  }

  // ControlValueAccessor implementation
  private onChange: (val: DateRangeValue) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: DateRangeValue | null): void {
    if (val && typeof val === 'object') {
      this.start.set(val.start || '');
      this.end.set(val.end || '');
    } else {
      this.start.set('');
      this.end.set('');
    }
  }

  registerOnChange(fn: (val: DateRangeValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // handled via input
  }

  private notifyChange(val: DateRangeValue): void {
    this.onChange(val);
    this.onTouched();
  }
}
