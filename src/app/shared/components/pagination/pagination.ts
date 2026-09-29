import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * Pagination — page navigation with first/prev/page-numbers/next/last.
 *
 * Usage:
 *   <app-pagination
 *     [total]="totalItems"
 *     [pageSize]="pageSize"
 *     [currentPage]="currentPage"
 *     (pageChange)="loadPage($event)"
 *   />
 *
 * Responsive:
 *   Mobile  — shows only prev/next + "Page X of Y"
 *   Desktop — shows full page number list
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  imports: [IconComponent],
  template: `
    @if (totalPages() > 1) {
      <nav
        class="flex flex-row items-center justify-between gap-2 sm:gap-4 w-full"
        aria-label="Pagination"
      >
        <!-- Count info -->
        <p class="text-xs sm:text-sm text-muted whitespace-nowrap shrink-0">
          <span class="hidden sm:inline">Showing </span>
          <span class="font-medium text-foreground">{{ startItem() }}</span>
          –
          <span class="font-medium text-foreground">{{ endItem() }}</span>
          <span> of </span>
          <span class="font-medium text-foreground">{{ total() }}</span>
          <span class="hidden md:inline"> records</span>
        </p>

        <!-- Controls -->
        <div class="flex items-center justify-end gap-1 sm:gap-1.5 shrink-0 ml-auto">
          <!-- First (Desktop only: lg+) -->
          <button
            type="button"
            class="hidden lg:flex"
            [class]="navBtnClass(currentPage() === 1)"
            [disabled]="currentPage() === 1"
            aria-label="First page"
            (click)="goTo(1)"
          >
            <app-icon name="chevron-left" size="xs" />
            <app-icon name="chevron-left" size="xs" class="-ml-2" />
          </button>

          <!-- Prev -->
          <button
            type="button"
            class="shrink-0"
            [class]="navBtnClass(currentPage() === 1)"
            [disabled]="currentPage() === 1"
            aria-label="Previous page"
            (click)="prev()"
          >
            <app-icon name="chevron-left" size="sm" />
            <span class="text-xs font-medium hidden md:inline">Prev</span>
          </button>

          <!-- Page numbers (tablet & desktop: sm+) -->
          <div class="hidden sm:flex items-center gap-1">
            @for (page of visiblePages(); track page) {
              @if (page === -1) {
                <span class="px-1.5 text-muted text-xs select-none">…</span>
              } @else {
                <button
                  type="button"
                  [class]="pageBtnClass(page)"
                  [attr.aria-current]="currentPage() === page ? 'page' : null"
                  (click)="goTo(page)"
                >
                  {{ page }}
                </button>
              }
            }
          </div>

          <!-- Mobile: Page X of Y Pill -->
          <span class="sm:hidden px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-xs font-semibold text-foreground whitespace-nowrap select-none">
            {{ currentPage() }} / {{ totalPages() }}
          </span>

          <!-- Next -->
          <button
            type="button"
            class="shrink-0"
            [class]="navBtnClass(currentPage() === totalPages())"
            [disabled]="currentPage() === totalPages()"
            aria-label="Next page"
            (click)="next()"
          >
            <span class="text-xs font-medium hidden md:inline">Next</span>
            <app-icon name="chevron-right" size="sm" />
          </button>

          <!-- Last (Desktop only: lg+) -->
          <button
            type="button"
            class="hidden lg:flex"
            [class]="navBtnClass(currentPage() === totalPages())"
            [disabled]="currentPage() === totalPages()"
            aria-label="Last page"
            (click)="goTo(totalPages())"
          >
            <app-icon name="chevron-right" size="xs" />
            <app-icon name="chevron-right" size="xs" class="-ml-2" />
          </button>
        </div>
      </nav>
    }
  `,
})
export class PaginationComponent {
  total = input.required<number>();
  pageSize = input(10);
  currentPage = input(1);
  /** Max page buttons to show. Default: 7. */
  maxVisible = input(7);

  pageChange = output<number>();

  protected readonly totalPages = computed(() =>
    Math.ceil(this.total() / this.pageSize()) || 1
  );

  protected readonly startItem = computed(() =>
    Math.min((this.currentPage() - 1) * this.pageSize() + 1, this.total())
  );

  protected readonly endItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.total())
  );

  protected readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const cur = this.currentPage();
    const max = this.maxVisible();

    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);

    const half = Math.floor(max / 2);
    let start = Math.max(1, cur - half);
    let end = Math.min(total, start + max - 1);
    if (end === total) start = Math.max(1, total - max + 1);

    const pages: number[] = [];
    if (start > 1) { pages.push(1); if (start > 2) pages.push(-1); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total) { if (end < total - 1) pages.push(-1); pages.push(total); }

    return pages;
  });

  protected navBtnClass(disabled: boolean): string {
    const base = 'flex h-8 sm:h-9 min-w-8 sm:min-w-9 items-center justify-center gap-1.5 px-2.5 rounded-lg border border-border text-xs sm:text-sm transition-colors';
    return disabled
      ? `${base} opacity-40 cursor-not-allowed bg-surface text-muted`
      : `${base} bg-surface text-foreground hover:bg-surface-raised hover:border-primary/40 cursor-pointer`;
  }

  protected pageBtnClass(page: number): string {
    const base = 'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer';
    return this.currentPage() === page
      ? `${base} bg-primary text-white border border-primary shadow-xs font-bold`
      : `${base} border border-border bg-surface text-foreground hover:bg-surface-raised`;
  }

  protected goTo(page: number): void {
    if (page !== this.currentPage()) this.pageChange.emit(page);
  }
  protected prev(): void { this.goTo(this.currentPage() - 1); }
  protected next(): void { this.goTo(this.currentPage() + 1); }
}
