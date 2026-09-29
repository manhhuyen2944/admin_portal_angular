import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { CheckboxComponent } from '../checkbox/checkbox';
import { LoadingShimmerComponent } from '../loading-shimmer/loading-shimmer';
import { PaginationComponent } from '../pagination/pagination';

export type SortDirection = 'asc' | 'desc' | null;
export type ColumnAlign = 'left' | 'center' | 'right';

export interface TableColumn<T = Record<string, unknown>> {
  /** Unique key — matches a property on T for auto-rendering */
  key: string;
  header: string;
  sortable?: boolean;
  align?: ColumnAlign;
  /** Fixed pixel width (e.g. '80px'). */
  width?: string;
  /** Min-width class (e.g. 'min-w-32'). */
  minWidth?: string;
  /** Custom value formatter. */
  formatter?: (row: T, value: unknown) => string;
  /** When set, a TemplateRef is used. The template receives { row, value }. */
  cellTemplate?: TemplateRef<{ row: T; value: unknown }>;
  /** Hide column on mobile (< md). */
  hideMobile?: boolean;
}

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface TableRowAction<T> {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: (row: T) => boolean;
}

/**
 * DataTable — sortable, filterable, paginated data table.
 *
 * Features:
 *   - Column definitions via [columns]
 *   - Server-side or client-side sort via [serverSort] toggle
 *   - Row selection (single / multiple) via [selectable]
 *   - Sticky header
 *   - Loading shimmer state
 *   - Empty state
 *   - Integrated pagination
 *   - Responsive: columns with hideMobile are hidden below md
 *
 * Usage:
 *   <app-data-table
 *     [columns]="columns"
 *     [data]="users"
 *     [total]="total"
 *     [loading]="loading"
 *     [selectable]="true"
 *     (sortChange)="loadSorted($event)"
 *     (pageChange)="loadPage($event)"
 *     (rowClick)="openUser($event)"
 *     (selectionChange)="selected = $event"
 *   />
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, IconComponent, CheckboxComponent, LoadingShimmerComponent, PaginationComponent],
  template: `
    <div class="flex flex-col gap-4">
      <!-- Table wrapper -->
      <div class="rounded-card border border-border bg-surface overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-border text-sm" role="grid">
            <!-- Head -->
            <thead class="bg-surface-raised sticky top-0 z-10">
              <tr>
                @if (selectable()) {
                  <th class="w-10 px-4 py-3">
                    <app-checkbox
                      [indeterminate]="isIndeterminate()"
                      [checked]="isAllSelected()"
                      (checkedChange)="toggleAll($event)"
                    />
                  </th>
                }
                @for (col of columns(); track col.key) {
                  <th
                    [class]="thClasses(col)"
                    [style.width]="col.width"
                    [attr.aria-sort]="ariaSortLabel(col)"
                  >
                    @if (col.sortable) {
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 font-semibold hover:text-primary transition-colors"
                        (click)="handleSort(col)"
                      >
                        {{ col.header }}
                        <app-icon [name]="sortIcon(col)" size="xs"
                                  [class.text-primary]="sortState().key === col.key"
                                  class="text-muted" />
                      </button>
                    } @else {
                      {{ col.header }}
                    }
                  </th>
                }
                @if (showActions()) {
                  <th class="w-14 px-4 py-3 text-right font-semibold text-foreground-secondary uppercase tracking-wide text-xs">
                    Actions
                  </th>
                }
              </tr>
            </thead>

            <!-- Body -->
            <tbody class="divide-y divide-border">
              @if (loading()) {
                @for (i of shimmerRows(); track i) {
                  <tr>
                    @if (selectable()) {
                      <td class="px-4 py-3">
                        <app-loading-shimmer variant="text" [lines]="1" />
                      </td>
                    }
                    @for (col of columns(); track col.key) {
                      <td class="px-4 py-3">
                        <app-loading-shimmer variant="text" [lines]="1" />
                      </td>
                    }
                  </tr>
                }
              } @else if (data().length === 0) {
                <tr>
                  <td [attr.colspan]="colspan()" class="px-6 py-16 text-center">
                    <div class="flex flex-col items-center gap-3">
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised">
                        <app-icon name="inbox" size="md" class="text-muted" />
                      </div>
                      <div>
                        <p class="font-medium text-foreground">{{ emptyTitle() }}</p>
                        <p class="text-sm text-muted mt-1">{{ emptyDescription() }}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (row of data(); track trackRow(row)) {
                  <tr
                    [class]="rowClasses(row)"
                    (click)="handleRowClick(row)"
                  >
                    @if (selectable()) {
                      <td class="px-4 py-3" (click)="$event.stopPropagation()">
                        <app-checkbox
                          [checked]="isSelected(row)"
                          (checkedChange)="toggleRow(row, $event)"
                        />
                      </td>
                    }
                    @for (col of columns(); track col.key) {
                      <td [class]="tdClasses(col)">
                        @if (col.cellTemplate) {
                          <ng-container
                            *ngTemplateOutlet="col.cellTemplate; context: { row: row, value: getCellValue(row, col) }"
                          />
                        } @else {
                          {{ formatCell(row, col) }}
                        }
                      </td>
                    }
                    @if (showActions()) {
                      <td class="px-4 py-3 text-right" (click)="$event.stopPropagation()">
                        <ng-content select="[row-actions]" />
                      </td>
                    }
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      @if (paginated() && total() > pageSize()) {
        <app-pagination
          [total]="total()"
          [pageSize]="pageSize()"
          [currentPage]="currentPage()"
          (pageChange)="handlePageChange($event)"
        />
      }
    </div>
  `,
})
export class DataTableComponent<T extends Record<string, unknown> = Record<string, unknown>> {
  columns = input.required<TableColumn<T>[]>();
  data = input<T[]>([]);
  total = input(0);
  pageSize = input(10);
  currentPage = input(1);
  paginated = input(true);
  loading = input(false);
  selectable = input(false);
  /** Key to uniquely track rows. Default: 'id'. */
  trackBy = input<keyof T>('id' as keyof T);
  showActions = input(false);
  emptyTitle = input('No data found');
  emptyDescription = input('Try adjusting your filters or adding new items.');
  rowClickable = input(false);
  /** Number of shimmer rows during loading. */
  loadingRows = input(5);

  sortChange = output<SortState>();
  pageChange = output<number>();
  rowClick = output<T>();
  selectionChange = output<T[]>();

  protected readonly sortState = signal<SortState>({ key: '', direction: null });
  protected readonly selectedRows = signal<Set<unknown>>(new Set());

  protected readonly isAllSelected = computed(() => {
    if (this.data().length === 0) return false;
    return this.data().every(row => this.selectedRows().has(row[this.trackBy()]));
  });

  protected readonly isIndeterminate = computed(() => {
    const s = this.selectedRows().size;
    return s > 0 && s < this.data().length;
  });

  protected readonly colspan = computed(() => {
    let n = this.columns().length;
    if (this.selectable()) n++;
    if (this.showActions()) n++;
    return n;
  });

  protected readonly shimmerRows = computed(() =>
    Array.from({ length: this.loadingRows() }, (_, i) => i)
  );

  protected trackRow(row: T): unknown { return row[this.trackBy()]; }
  protected isSelected(row: T): boolean { return this.selectedRows().has(row[this.trackBy()]); }

  protected getCellValue(row: T, col: TableColumn<T>): unknown {
    return col.key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], row);
  }

  protected formatCell(row: T, col: TableColumn<T>): string {
    const val = this.getCellValue(row, col);
    if (col.formatter) return col.formatter(row, val);
    if (val === null || val === undefined) return '—';
    return String(val);
  }

  protected thClasses(col: TableColumn<T>): string {
    const base = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-secondary';
    const align = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '';
    const hide = col.hideMobile ? 'hidden md:table-cell' : '';
    return `${base} ${align} ${hide}`.trim();
  }

  protected tdClasses(col: TableColumn<T>): string {
    const base = 'px-4 py-3 text-foreground';
    const align = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '';
    const hide = col.hideMobile ? 'hidden md:table-cell' : '';
    const minW = col.minWidth ?? '';
    return `${base} ${align} ${hide} ${minW}`.trim();
  }

  protected rowClasses(row: T): string {
    const base = 'transition-colors';
    const selected = this.isSelected(row) ? 'bg-primary/5' : 'hover:bg-surface-raised';
    const clickable = this.rowClickable() ? 'cursor-pointer' : '';
    return `${base} ${selected} ${clickable}`.trim();
  }

  protected sortIcon(col: TableColumn<T>): 'chevrons-up-down' | 'chevron-up' | 'chevron-down' {
    if (this.sortState().key !== col.key) return 'chevrons-up-down';
    return this.sortState().direction === 'asc' ? 'chevron-up' : 'chevron-down';
  }

  protected ariaSortLabel(col: TableColumn<T>): string | null {
    if (!col.sortable) return null;
    if (this.sortState().key !== col.key) return 'none';
    return this.sortState().direction === 'asc' ? 'ascending' : 'descending';
  }

  protected handleSort(col: TableColumn<T>): void {
    if (!col.sortable) return;
    const cur = this.sortState();
    let dir: SortDirection;
    if (cur.key !== col.key) dir = 'asc';
    else if (cur.direction === 'asc') dir = 'desc';
    else dir = null;

    const next: SortState = dir ? { key: col.key, direction: dir } : { key: '', direction: null };
    this.sortState.set(next);
    this.sortChange.emit(next);
  }

  protected handleRowClick(row: T): void {
    if (this.rowClickable()) this.rowClick.emit(row);
  }

  protected handlePageChange(page: number): void {
    this.pageChange.emit(page);
  }

  protected toggleAll(checked: boolean): void {
    if (checked) {
      this.selectedRows.set(new Set(this.data().map(r => r[this.trackBy()])));
    } else {
      this.selectedRows.set(new Set());
    }
    this.emitSelection();
  }

  protected toggleRow(row: T, checked: boolean): void {
    this.selectedRows.update(s => {
      const next = new Set(s);
      if (checked) next.add(row[this.trackBy()]);
      else next.delete(row[this.trackBy()]);
      return next;
    });
    this.emitSelection();
  }

  private emitSelection(): void {
    const selected = this.data().filter(r => this.selectedRows().has(r[this.trackBy()]));
    this.selectionChange.emit(selected);
  }
}
