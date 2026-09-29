import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';

export interface QuickFilterOption {
  id: string;
  label: string;
  count?: number;
  icon?: IconName;
  color?: string;
}

/**
 * QuickFilters — interactive multi-selection chip bar for fast dataset filtering.
 *
 * Usage:
 *   <app-quick-filters
 *     [options]="filterOptions"
 *     [(selected)]="activeFilterIds"
 *     (filterChange)="onFilterChanged($event)"
 *   />
 */
@Component({
  selector: 'app-quick-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="flex flex-col gap-2.5 w-full">
      <!-- Header row: Label & Actions -->
      <div class="flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">
        @if (label()) {
          <div class="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
            <app-icon name="filter" size="xs" class="text-primary shrink-0" />
            <span>{{ label() }}</span>
          </div>
        }

        <!-- Action buttons & Active Count -->
        <div class="flex items-center gap-2 ml-auto shrink-0">
          @if (selected().length > 0) {
            <span class="text-[11px] sm:text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {{ selected().length }} selected
            </span>
            <button
              type="button"
              class="text-xs font-medium text-muted hover:text-danger hover:underline transition-colors cursor-pointer"
              (click)="clearAll()"
            >
              Clear all
            </button>
          } @else if (showSelectAll()) {
            <button
              type="button"
              class="text-xs font-medium text-muted hover:text-primary hover:underline transition-colors cursor-pointer"
              (click)="selectAll()"
            >
              Select all
            </button>
          }
        </div>
      </div>

      <!-- Filter Chips List -->
      <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
        @for (opt of options(); track opt.id) {
          @let isActive = isSelected(opt.id);
          <button
            type="button"
            class="group inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 cursor-pointer select-none min-h-[32px] sm:min-h-[34px]"
            [class]="isActive
              ? 'bg-primary text-white border-primary shadow-xs font-semibold'
              : 'bg-surface text-muted hover:text-foreground border-border hover:border-primary/40 hover:bg-surface-raised'"
            (click)="toggleFilter(opt.id)"
            [attr.aria-pressed]="isActive"
          >
            @if (isActive) {
              <app-icon name="check" size="xs" class="text-white shrink-0 animate-in zoom-in-75 duration-100" />
            } @else if (opt.icon) {
              <app-icon [name]="opt.icon" size="xs" class="shrink-0 text-muted group-hover:text-foreground transition-colors" />
            }

            <span class="truncate">{{ opt.label }}</span>

            @if (opt.count !== undefined) {
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-tight shrink-0"
                [class]="isActive
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-surface-raised text-muted group-hover:text-foreground'"
              >
                {{ opt.count }}
              </span>
            }
          </button>
        }
      </div>
    </div>
  `,
})
export class QuickFiltersComponent {
  /** Optional title or section label */
  label = input<string | undefined>('Quick Filters');

  /** Available filter items */
  options = input.required<QuickFilterOption[]>();

  /** Two-way multi-selected filter IDs */
  selected = model<string[]>([]);

  /** Allow 'Select all' action button */
  showSelectAll = input(true);

  /** Emits whenever selected filter IDs change */
  filterChange = output<string[]>();

  isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  toggleFilter(id: string): void {
    const current = this.selected();
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];

    this.selected.set(next);
    this.filterChange.emit(next);
  }

  clearAll(): void {
    this.selected.set([]);
    this.filterChange.emit([]);
  }

  selectAll(): void {
    const allIds = this.options().map((o) => o.id);
    this.selected.set(allIds);
    this.filterChange.emit(allIds);
  }
}
