import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';
import { IconButtonComponent } from '../icon-button/icon-button';

export type DatePickerMode = 'single' | 'range' | 'time' | 'datetime';
export type CalendarViewMode = 'day' | 'month' | 'year';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange?: boolean;
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

/**
 * DatePicker — modern custom calendar popup and formatted date input.
 * Supports quick Month and Year selection grids, decade navigation,
 * signals, ControlValueAccessor ([(ngModel)] / formControl), and dark mode.
 */
@Component({
  selector: 'app-date-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, IconButtonComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerComponent),
    multi: true,
  }],
  template: `
    <div class="relative w-full">
      @if (mode() === 'range') {
        <!-- Range Mode: Dual Input Bar -->
        <div class="flex items-center gap-2">
          <!-- Start Date Trigger -->
          <div class="relative flex-1">
            <button
              type="button"
              [class]="triggerClasses()"
              [disabled]="isDisabled()"
              (click)="toggleOpen('start')"
            >
              <div class="flex items-center gap-2 min-w-0">
                <app-icon name="calendar" size="xs" class="text-primary shrink-0" />
                <span class="truncate" [class.text-muted]="!rangeStart()">
                  {{ formatDisplayDate(rangeStart()) || 'Start date' }}
                </span>
              </div>
              @if (rangeStart() && !isDisabled()) {
                <span
                  role="button"
                  tabindex="0"
                  class="p-0.5 rounded hover:bg-surface-raised text-muted hover:text-foreground"
                  (click)="clearRangeStart($event)"
                >
                  <app-icon name="x" size="xs" />
                </span>
              }
            </button>
          </div>

          <app-icon name="arrow-right" size="xs" class="text-muted shrink-0" />

          <!-- End Date Trigger -->
          <div class="relative flex-1">
            <button
              type="button"
              [class]="triggerClasses()"
              [disabled]="isDisabled()"
              (click)="toggleOpen('end')"
            >
              <div class="flex items-center gap-2 min-w-0">
                <app-icon name="calendar" size="xs" class="text-primary shrink-0" />
                <span class="truncate" [class.text-muted]="!rangeEnd()">
                  {{ formatDisplayDate(rangeEnd()) || 'End date' }}
                </span>
              </div>
              @if (rangeEnd() && !isDisabled()) {
                <span
                  role="button"
                  tabindex="0"
                  class="p-0.5 rounded hover:bg-surface-raised text-muted hover:text-foreground"
                  (click)="clearRangeEnd($event)"
                >
                  <app-icon name="x" size="xs" />
                </span>
              }
            </button>
          </div>
        </div>
      } @else {
        <!-- Single Mode: Custom Formatted Trigger -->
        <div class="relative w-full">
          <button
            type="button"
            [id]="id()"
            [class]="triggerClasses()"
            [disabled]="isDisabled()"
            [attr.aria-expanded]="isOpen()"
            [attr.aria-haspopup]="'dialog'"
            (click)="toggleOpen('single')"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <app-icon name="calendar" size="xs" />
              </div>
              <span class="truncate text-sm font-medium" [class.text-muted]="!value()">
                {{ formattedDisplay() }}
              </span>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              @if (value() && !isDisabled()) {
                <span
                  role="button"
                  tabindex="0"
                  class="p-1 rounded-md hover:bg-surface-raised text-muted hover:text-foreground transition-colors"
                  title="Clear date"
                  (click)="clearSingleDate($event)"
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
        </div>
      }

      <!-- Custom Calendar Dropdown Popup -->
      @if (isOpen()) {
        <div
          class="absolute left-0 mt-2 z-[var(--z-dropdown,40)] w-[320px] p-4 rounded-2xl border border-border bg-surface shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
          aria-label="Calendar selection"
          (click)="$event.stopPropagation()"
        >
          <!-- Calendar Header with Quick Mode Selectors -->
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
            <app-icon-button
              name="chevron-left"
              label="Previous"
              size="xs"
              variant="ghost"
              (click)="handlePrevNav($event)"
            />

            <!-- Center header: Clickable Month & Year pills to quickly switch modes -->
            @switch (viewMode()) {
              @case ('day') {
                <div class="flex items-center gap-1">
                  <!-- Quick Month Picker Button -->
                  <button
                    type="button"
                    class="px-2 py-1 rounded-lg text-xs font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                    title="Click to quickly pick month"
                    (click)="viewMode.set('month')"
                  >
                    <span>{{ currentMonthName() }}</span>
                    <app-icon name="chevron-down" size="xs" class="text-muted" />
                  </button>

                  <!-- Quick Year Picker Button -->
                  <button
                    type="button"
                    class="px-2 py-1 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer flex items-center gap-1"
                    title="Click to quickly pick year"
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

          <!-- 1. DAY VIEW -->
          @if (viewMode() === 'day') {
            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 gap-1 mb-2 text-center">
              @for (day of weekdays; track day) {
                <span class="text-[11px] font-semibold text-muted uppercase tracking-wider py-1">
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
                  [class]="dayButtonClasses(day)"
                  [attr.aria-label]="day.isoString"
                  (click)="selectDay(day, $event)"
                >
                  <span>{{ day.dayNumber }}</span>
                  @if (day.isToday && !day.isSelected) {
                    <span class="absolute bottom-1 h-1 w-1 rounded-full bg-primary"></span>
                  }
                </button>
              }
            </div>
          }

          <!-- 2. QUICK MONTH SELECTION GRID -->
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

          <!-- 3. QUICK YEAR SELECTION GRID (DECADE) -->
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

          <!-- Quick Action Footer -->
          <div class="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-xs">
            @if (viewMode() !== 'day') {
              <button
                type="button"
                class="font-medium text-primary hover:underline transition-colors cursor-pointer"
                (click)="viewMode.set('day')"
              >
                &larr; Back to Days
              </button>
            } @else {
              <button
                type="button"
                class="font-medium text-muted hover:text-foreground hover:underline transition-colors cursor-pointer"
                (click)="selectToday($event)"
              >
                Today
              </button>
            }

            <button
              type="button"
              class="font-medium text-danger hover:underline transition-colors cursor-pointer"
              (click)="resetCurrentSelection($event)"
            >
              Clear
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class DatePickerComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

  mode = input<DatePickerMode>('single');
  id = input<string | undefined>(undefined);
  placeholder = input<string>('Select date...');
  min = input<string | undefined>(undefined);
  max = input<string | undefined>(undefined);
  hasError = input(false);

  // States
  protected readonly value = signal('');
  protected readonly rangeStart = signal('');
  protected readonly rangeEnd = signal('');
  protected readonly isDisabled = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly activeTarget = signal<'single' | 'start' | 'end'>('single');

  // Calendar View Mode: 'day' | 'month' | 'year'
  protected readonly viewMode = signal<CalendarViewMode>('day');

  // View state for month & year navigation
  protected readonly viewMonth = signal(new Date().getMonth());
  protected readonly viewYear = signal(new Date().getFullYear());

  protected readonly weekdays = WEEKDAY_NAMES;
  protected readonly monthsShort = MONTHS_SHORT;

  protected readonly currentMonthName = computed(() => {
    return MONTH_NAMES[this.viewMonth()];
  });

  // Decade bounds for year view (e.g. 2016-2027 or 2024-2035)
  protected readonly decadeStart = computed(() => {
    return Math.floor(this.viewYear() / 12) * 12;
  });

  protected readonly decadeYears = computed(() => {
    const start = this.decadeStart();
    return Array.from({ length: 12 }, (_, i) => start + i);
  });

  protected readonly formattedDisplay = computed(() => {
    const val = this.value();
    if (!val) return this.placeholder();
    return this.formatDisplayDate(val) || val;
  });

  protected readonly triggerClasses = computed(() => {
    const base = [
      'flex items-center justify-between w-full h-10 px-3 py-1.5 rounded-xl border bg-surface text-sm text-foreground',
      'shadow-xs cursor-pointer transition-all duration-150',
      'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ');
    const border = this.hasError() ? 'border-danger ring-1 ring-danger/20' : 'border-border';
    const openState = this.isOpen() ? 'border-primary ring-2 ring-primary/20' : '';
    return `${base} ${border} ${openState}`;
  });

  // Calendar Day Generation
  protected readonly calendarDays = computed<CalendarDay[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const todayStr = this.toIsoDate(new Date());

    const selectedIso = this.activeTarget() === 'end' ? this.rangeEnd() : (this.activeTarget() === 'start' ? this.rangeStart() : this.value());

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const date = new Date(year, month - 1, dayNum);
      const iso = this.toIsoDate(date);
      days.push({
        date,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: iso === todayStr,
        isSelected: iso === selectedIso,
        isDisabled: this.isDateDisabled(iso),
        isoString: iso,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = this.toIsoDate(date);
      days.push({
        date,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: iso === todayStr,
        isSelected: iso === selectedIso,
        isDisabled: this.isDateDisabled(iso),
        isoString: iso,
      });
    }

    // Next month leading days to complete grid (up to 35 or 42)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const date = new Date(year, month + 1, n);
      const iso = this.toIsoDate(date);
      days.push({
        date,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: iso === todayStr,
        isSelected: iso === selectedIso,
        isDisabled: this.isDateDisabled(iso),
        isoString: iso,
      });
    }

    return days;
  });

  // Close calendar popup on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.viewMode.set('day');
    }
  }

  // Close on Escape key
  @HostListener('keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
    this.viewMode.set('day');
  }

  protected toggleOpen(target: 'single' | 'start' | 'end'): void {
    if (this.isDisabled()) return;
    if (this.isOpen() && this.activeTarget() === target) {
      this.isOpen.set(false);
      this.viewMode.set('day');
      return;
    }

    this.activeTarget.set(target);
    this.viewMode.set('day');

    // Sync view month/year with active value if present
    const activeVal = target === 'start' ? this.rangeStart() : (target === 'end' ? this.rangeEnd() : this.value());
    if (activeVal) {
      const parsed = new Date(activeVal);
      if (!isNaN(parsed.getTime())) {
        this.viewMonth.set(parsed.getMonth());
        this.viewYear.set(parsed.getFullYear());
      }
    } else {
      const now = new Date();
      this.viewMonth.set(now.getMonth());
      this.viewYear.set(now.getFullYear());
    }

    this.isOpen.set(true);
  }

  // Handle header previous button according to active view mode
  protected handlePrevNav(event: MouseEvent): void {
    event.stopPropagation();
    switch (this.viewMode()) {
      case 'year':
        this.viewYear.update(y => y - 12);
        break;
      case 'month':
        this.viewYear.update(y => y - 1);
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

  // Handle header next button according to active view mode
  protected handleNextNav(event: MouseEvent): void {
    event.stopPropagation();
    switch (this.viewMode()) {
      case 'year':
        this.viewYear.update(y => y + 12);
        break;
      case 'month':
        this.viewYear.update(y => y + 1);
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

  // Quick Select Month
  protected selectMonth(monthIndex: number, event: MouseEvent): void {
    event.stopPropagation();
    this.viewMonth.set(monthIndex);
    this.viewMode.set('day');
  }

  // Quick Select Year
  protected selectYear(year: number, event: MouseEvent): void {
    event.stopPropagation();
    this.viewYear.set(year);
    this.viewMode.set('month'); // Guide user to select month next, or can click Back to Days
  }

  protected selectDay(day: CalendarDay, event: MouseEvent): void {
    event.stopPropagation();
    if (day.isDisabled) return;

    if (this.activeTarget() === 'start') {
      this.rangeStart.set(day.isoString);
      this.emitRange();
    } else if (this.activeTarget() === 'end') {
      this.rangeEnd.set(day.isoString);
      this.emitRange();
    } else {
      this.value.set(day.isoString);
      this._onChange(day.isoString);
    }

    this._onTouched();
    this.isOpen.set(false);
    this.viewMode.set('day');
  }

  protected selectToday(event: MouseEvent): void {
    event.stopPropagation();
    const now = new Date();
    const todayIso = this.toIsoDate(now);

    this.viewMonth.set(now.getMonth());
    this.viewYear.set(now.getFullYear());
    this.viewMode.set('day');

    if (this.activeTarget() === 'start') {
      this.rangeStart.set(todayIso);
      this.emitRange();
    } else if (this.activeTarget() === 'end') {
      this.rangeEnd.set(todayIso);
      this.emitRange();
    } else {
      this.value.set(todayIso);
      this._onChange(todayIso);
    }

    this.isOpen.set(false);
  }

  protected resetCurrentSelection(event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeTarget() === 'start') {
      this.rangeStart.set('');
      this.emitRange();
    } else if (this.activeTarget() === 'end') {
      this.rangeEnd.set('');
      this.emitRange();
    } else {
      this.value.set('');
      this._onChange('');
    }
    this.isOpen.set(false);
    this.viewMode.set('day');
  }

  protected clearSingleDate(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set('');
    this._onChange('');
    this._onTouched();
  }

  protected clearRangeStart(event: MouseEvent): void {
    event.stopPropagation();
    this.rangeStart.set('');
    this.emitRange();
  }

  protected clearRangeEnd(event: MouseEvent): void {
    event.stopPropagation();
    this.rangeEnd.set('');
    this.emitRange();
  }

  protected dayButtonClasses(day: CalendarDay): string {
    const base = 'relative h-8 w-8 text-xs font-medium rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer';

    if (day.isDisabled) {
      return `${base} opacity-25 cursor-not-allowed text-muted pointer-events-none`;
    }

    if (day.isSelected) {
      return `${base} bg-primary text-white font-bold shadow-md shadow-primary/30 scale-105`;
    }

    if (day.isToday) {
      return `${base} font-bold text-primary border border-primary/40 hover:bg-primary/10`;
    }

    if (!day.isCurrentMonth) {
      return `${base} text-muted/40 hover:text-muted hover:bg-surface-raised`;
    }

    return `${base} text-foreground hover:bg-primary/10 hover:text-primary`;
  }

  private isDateDisabled(iso: string): boolean {
    const minVal = this.min();
    const maxVal = this.max();
    if (minVal && iso < minVal) return true;
    if (maxVal && iso > maxVal) return true;
    return false;
  }

  private toIsoDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  protected formatDisplayDate(iso: string): string {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return iso;

    const shortMonth = MONTH_NAMES[month]?.slice(0, 3) ?? '';
    return `${shortMonth} ${day}, ${year}`;
  }

  // ControlValueAccessor methods
  private _onChange: (v: string | { start: string; end: string } | null) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(value: string | { start: string; end: string } | null): void {
    if (this.mode() === 'range' && value && typeof value === 'object') {
      this.rangeStart.set((value as { start: string }).start ?? '');
      this.rangeEnd.set((value as { end: string }).end ?? '');
    } else {
      this.value.set((value as string) ?? '');
    }
  }

  registerOnChange(fn: (v: string | { start: string; end: string } | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  private emitRange(): void {
    this._onChange({ start: this.rangeStart(), end: this.rangeEnd() });
  }
}
