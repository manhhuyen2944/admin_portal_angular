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
import type { IconName } from '../icon/icon-registry';
import type { SelectOption } from '../select/select';

export type { SelectOption } from '../select/select';

/**
 * MultiSelectComponent — Modern custom dropdown select supporting multi-item choice,
 * real-time search filtering, removable chips in trigger, and quick Select/Clear All actions.
 *
 * Usage:
 *   <app-multi-select
 *     [options]="roleOptions"
 *     [(selected)]="selectedRoles"
 *     [searchable]="true"
 *     placeholder="Choose roles..."
 *   />
 *
 *   <!-- Or with [(ngModel)] / Reactive Forms -->
 *   <app-multi-select
 *     [options]="userList"
 *     [(ngModel)]="assignedUsers"
 *     name="assignedUsers"
 *   />
 */
@Component({
  selector: 'app-multi-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full">
      <!-- Trigger Input Bar -->
      <div
        role="combobox"
        tabindex="0"
        [id]="id()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="'listbox'"
        [class]="triggerClasses()"
        (click)="toggleOpen()"
        (keydown.space)="$event.preventDefault(); toggleOpen()"
        (keydown.enter)="$event.preventDefault(); toggleOpen()"
      >
        <!-- Left: Selected Chips or Placeholder -->
        <div class="flex flex-wrap items-center gap-1.5 min-w-0 flex-1 py-0.5">
          @if (selectedOptions().length === 0) {
            <span class="text-sm text-muted truncate select-none">
              {{ placeholder() }}
            </span>
          } @else {
            @for (opt of displayedChips(); track opt.value) {
              <span
                class="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20 animate-in fade-in zoom-in-95 duration-100"
              >
                @if (opt.icon) {
                  <app-icon [name]="opt.icon" size="xs" class="shrink-0" />
                }
                <span class="truncate max-w-[120px]">{{ opt.label }}</span>
                @if (!disabled()) {
                  <button
                    type="button"
                    class="p-0.5 rounded hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                    [attr.aria-label]="'Remove ' + opt.label"
                    (click)="removeSingle(opt, $event)"
                  >
                    <app-icon name="x" size="xs" />
                  </button>
                }
              </span>
            }

            @if (remainingChipsCount() > 0) {
              <span class="inline-flex items-center px-1.5 py-0.5 rounded-md bg-surface-raised border border-border text-[11px] font-semibold text-muted">
                +{{ remainingChipsCount() }} more
              </span>
            }
          }
        </div>

        <!-- Right: Clear and Dropdown Toggle Chevron -->
        <div class="flex items-center gap-1 shrink-0 ml-1">
          @if (clearable() && selected().length > 0 && !disabled()) {
            <button
              type="button"
              class="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              title="Clear all selected"
              (click)="clearAll($event)"
            >
              <app-icon name="x" size="xs" />
            </button>
          }

          <app-icon
            name="chevron-down"
            size="xs"
            class="text-muted transition-transform duration-200"
            [class.rotate-180]="isOpen()"
          />
        </div>
      </div>

      <!-- Dropdown Panel -->
      @if (isOpen()) {
        <div
          class="absolute left-0 right-0 top-full mt-1.5 z-[var(--z-dropdown,1000)] rounded-xl border border-border bg-surface shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
          aria-multiselectable="true"
          (click)="$event.stopPropagation()"
        >
          <!-- Search Header -->
          @if (searchable()) {
            <div class="p-2 border-b border-border/70 bg-surface-raised/30">
              <div class="relative">
                <app-icon
                  name="search"
                  size="xs"
                  class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
                <input
                  type="text"
                  class="w-full h-8 pl-8 pr-7 text-base lg:text-xs rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  [placeholder]="searchPlaceholder()"
                  [value]="searchQuery()"
                  (input)="onSearchInput($event)"
                />
                @if (searchQuery()) {
                  <button
                    type="button"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5 cursor-pointer"
                    (click)="searchQuery.set('')"
                  >
                    <app-icon name="x" size="xs" />
                  </button>
                }
              </div>
            </div>
          }

          <!-- Quick Actions Bar (Select All / Clear All & Count) -->
          <div class="flex items-center justify-between px-3 py-1.5 border-b border-border/50 text-[11px] bg-surface-raised/20">
            <span class="text-muted font-medium">
              <strong class="text-foreground font-semibold">{{ selected().length }}</strong> of {{ options().length }} selected
            </span>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="font-medium text-primary hover:underline transition-colors cursor-pointer"
                (click)="toggleSelectAll()"
              >
                {{ isAllSelected() ? 'Deselect All' : 'Select All' }}
              </button>
              @if (selected().length > 0) {
                <span class="text-muted/40">&bull;</span>
                <button
                  type="button"
                  class="font-medium text-danger hover:underline transition-colors cursor-pointer"
                  (click)="clearAll($event)"
                >
                  Clear
                </button>
              }
            </div>
          </div>

          <!-- Options List -->
          <div class="max-h-60 overflow-y-auto p-1 space-y-0.5">
            @if (filteredOptions().length === 0) {
              <div class="py-6 px-3 text-center text-xs text-muted flex flex-col items-center gap-1.5">
                <app-icon name="search" size="sm" class="text-muted/60" />
                <span>No matching options found</span>
              </div>
            } @else {
              @for (opt of filteredOptions(); track opt.value) {
                <button
                  type="button"
                  role="option"
                  [attr.aria-selected]="isSelected(opt)"
                  [disabled]="opt.disabled"
                  [class]="optionClasses(opt)"
                  (click)="toggleOption(opt)"
                >
                  <!-- Checkbox square -->
                  <div
                    class="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-150"
                    [class]="isSelected(opt)
                      ? 'bg-primary border-primary text-white shadow-xs'
                      : 'border-border bg-surface text-transparent group-hover:border-primary/50'"
                  >
                    <app-icon name="check" size="xs" />
                  </div>

                  <!-- Optional Option Icon -->
                  @if (opt.icon) {
                    <app-icon [name]="opt.icon" size="xs" class="shrink-0 text-muted" />
                  }

                  <!-- Option Label -->
                  <span class="flex-1 text-left truncate text-xs font-medium" [class.text-primary]="isSelected(opt)">
                    {{ opt.label }}
                  </span>

                  <!-- Optional Badge / Count -->
                  @if (opt.badge) {
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-raised border border-border text-muted">
                      {{ opt.badge }}
                    </span>
                  }
                </button>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class MultiSelectComponent<T = string> implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

  options = input<SelectOption<T>[]>([]);
  selected = model<T[]>([]);
  placeholder = input('Select options...');
  searchPlaceholder = input('Search options...');
  searchable = input(true);
  clearable = input(true);
  maxDisplayedChips = input(3);
  disabled = input(false);
  hasError = input(false);
  id = input<string | undefined>(undefined);

  protected readonly isOpen = signal(false);
  protected readonly searchQuery = signal('');

  protected readonly selectedOptions = computed(() => {
    const sel = this.selected();
    const opts = this.options();
    return opts.filter((o) => sel.includes(o.value));
  });

  protected readonly displayedChips = computed(() => {
    const list = this.selectedOptions();
    const max = this.maxDisplayedChips();
    return list.slice(0, max);
  });

  protected readonly remainingChipsCount = computed(() => {
    const total = this.selected().length;
    const max = this.maxDisplayedChips();
    return total > max ? total - max : 0;
  });

  protected readonly filteredOptions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const opts = this.options();
    if (!q) return opts;
    return opts.filter((o) => o.label.toLowerCase().includes(q));
  });

  protected readonly isAllSelected = computed(() => {
    const total = this.options().filter((o) => !o.disabled).length;
    if (total === 0) return false;
    return this.selected().length === total;
  });

  protected readonly triggerClasses = computed(() => {
    const base = [
      'flex items-center justify-between w-full min-h-10 px-3 py-1.5 rounded-xl border bg-surface text-foreground',
      'shadow-xs cursor-pointer transition-all duration-150',
      'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ');
    const border = this.hasError() ? 'border-danger ring-1 ring-danger/20' : 'border-border';
    const open = this.isOpen() ? 'border-primary ring-2 ring-primary/20' : '';
    return `${base} ${border} ${open}`;
  });

  protected optionClasses(opt: SelectOption<T>): string {
    const base = 'flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer group';
    if (opt.disabled) return `${base} opacity-50 cursor-not-allowed`;
    if (this.isSelected(opt)) return `${base} bg-primary/10 text-primary font-semibold`;
    return `${base} text-foreground hover:bg-surface-raised`;
  }

  protected isSelected(opt: SelectOption<T>): boolean {
    return this.selected().includes(opt.value);
  }

  toggleOpen(): void {
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.isOpen.set(true);
      this.searchQuery.set('');
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  toggleOption(opt: SelectOption<T>): void {
    if (opt.disabled || this.disabled()) return;
    const cur = this.selected();
    const idx = cur.indexOf(opt.value);
    const updated = idx >= 0 ? cur.filter((_, i) => i !== idx) : [...cur, opt.value];
    this.updateSelected(updated);
  }

  removeSingle(opt: SelectOption<T>, event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;
    const updated = this.selected().filter((v) => v !== opt.value);
    this.updateSelected(updated);
  }

  clearAll(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.disabled()) return;
    this.updateSelected([]);
  }

  toggleSelectAll(): void {
    if (this.disabled()) return;
    if (this.isAllSelected()) {
      this.updateSelected([]);
    } else {
      const allEnabled = this.options()
        .filter((o) => !o.disabled)
        .map((o) => o.value);
      this.updateSelected(allEnabled);
    }
  }

  protected onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  private updateSelected(vals: T[]): void {
    this.selected.set(vals);
    this.onChange(vals);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.close();
  }

  // ControlValueAccessor
  private onChange: (val: T[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: T[] | null): void {
    this.selected.set(Array.isArray(val) ? val : []);
  }

  registerOnChange(fn: (val: T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // handled via disabled input
  }
}
