import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: IconName;
  badge?: string;
}

export type SelectMode = 'single' | 'multiple';

/**
 * Select — single & multiple select with search, all via config (not separate components).
 * Modes: single (default), multiple.
 * Searchable via [searchable]="true".
 *
 * Do NOT create MultiSelectNew, AsyncSelect as separate components.
 *
 * Usage:
 *   <!-- Single: -->
 *   <app-select [options]="roles" formControlName="role" placeholder="Select role" />
 *
 *   <!-- Multiple: -->
 *   <app-select [options]="tags" mode="multiple" formControlName="tags" />
 *
 *   <!-- Searchable: -->
 *   <app-select [options]="countries" [searchable]="true" formControlName="country" />
 *
 * TODO Phase 4: Refactor dropdown panel to use <app-dropdown> when Dropdown is ready.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true,
  }],
  template: `
    <div class="relative w-full" (keydown.escape)="close()">
      <!-- Trigger bar -->
      <div
        role="combobox"
        tabindex="0"
        [class]="triggerClasses()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-invalid]="hasError() || null"
        [attr.aria-disabled]="isDisabled() || null"
        (click)="toggle()"
        (keydown.space)="$event.preventDefault(); toggle()"
        (keydown.enter)="$event.preventDefault(); toggle()"
        (blur)="onBlur()"
      >
        <span class="flex-1 text-left truncate min-w-0 select-none">
          @if (displayValue()) {
            {{ displayValue() }}
          } @else {
            <span class="text-muted">{{ placeholder() }}</span>
          }
        </span>
        @if (hasClearable() && value() && !isDisabled()) {
          <span
            role="button"
            tabindex="0"
            class="shrink-0 text-muted hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
            aria-label="Clear selection"
            (click)="clearValue($event)"
            (keydown.space)="$event.stopPropagation(); clearValue($event)"
            (keydown.enter)="$event.stopPropagation(); clearValue($event)"
          >
            <app-icon name="x" size="xs" />
          </span>
        }
        <app-icon
          [name]="isOpen() ? 'chevron-up' : 'chevron-down'"
          size="sm"
          class="shrink-0 text-muted"
        />
      </div>

      <!-- Dropdown panel -->
      @if (isOpen()) {
        <div class="fixed inset-0 z-[var(--z-dropdown)]" (click)="close()"></div>
        <div
          class="absolute left-0 right-0 top-full mt-1 z-[calc(var(--z-dropdown)+1)]
                 rounded-lg border border-border bg-surface shadow-lg
                 overflow-hidden"
          role="listbox"
          [attr.aria-multiselectable]="mode() === 'multiple'"
        >
          <!-- Search -->
          @if (searchable()) {
            <div class="p-2 border-b border-border">
              <div class="relative">
                <app-icon name="search" size="sm" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  #searchInput
                  type="text"
                  class="w-full h-8 pl-8 pr-3 text-base lg:text-sm border border-border rounded-md
                         bg-surface text-foreground placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="Search..."
                  [value]="searchQuery()"
                  (input)="onSearch($event)"
                  (click)="$event.stopPropagation()"
                />
              </div>
            </div>
          }

          <!-- Options list -->
          <div class="max-h-60 overflow-y-auto py-1">
            @if (filteredOptions().length === 0) {
              <div class="px-3 py-6 text-center text-sm text-muted">No options found</div>
            } @else {
              @for (option of filteredOptions(); track option.value) {
                <button
                  type="button"
                  [disabled]="option.disabled"
                  [class]="optionClasses(option)"
                  role="option"
                  [attr.aria-selected]="isSelected(option)"
                  (click)="selectOption(option)"
                >
                  @if (mode() === 'multiple') {
                    <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border
                                 transition-colors"
                          [class]="isSelected(option)
                            ? 'bg-primary border-primary'
                            : 'border-border'">
                      @if (isSelected(option)) {
                        <app-icon name="check" size="xs" class="text-white" />
                      }
                    </span>
                  }
                  <span class="flex-1 text-left truncate">{{ option.label }}</span>
                  @if (mode() === 'single' && isSelected(option)) {
                    <app-icon name="check" size="sm" class="text-primary shrink-0" />
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
export class SelectComponent<T = string> implements ControlValueAccessor {
  options = input<SelectOption<T>[]>([]);
  mode = input<SelectMode>('single');
  placeholder = input('Select...');
  searchable = input(false);
  clearable = input(false);
  hasError = input(false);
  id = input<string | undefined>(undefined);

  protected readonly value = signal<T | T[] | null>(null);
  protected readonly isDisabled = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly searchQuery = signal('');

  protected readonly hasClearable = computed(() => this.clearable());

  protected readonly displayValue = computed(() => {
    const val = this.value();
    if (!val) return '';
    if (this.mode() === 'multiple' && Array.isArray(val)) {
      if (val.length === 0) return '';
      if (val.length === 1) {
        return this.options().find(o => o.value === val[0])?.label ?? '';
      }
      return `${val.length} selected`;
    }
    return this.options().find(o => o.value === val)?.label ?? '';
  });

  protected readonly filteredOptions = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.options();
    return this.options().filter(o => o.label.toLowerCase().includes(q));
  });

  protected readonly triggerClasses = computed(() => {
    const base = [
      'flex w-full items-center gap-2 rounded-xl border px-3 h-10 text-sm text-foreground cursor-pointer select-none shadow-xs',
      'bg-surface transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
    ].join(' ');
    const disabledState = this.isDisabled() ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    const border = this.hasError() ? 'border-danger ring-1 ring-danger/20' : 'border-border';
    const openState = this.isOpen() ? 'border-primary ring-2 ring-primary/20' : '';
    return `${base} ${border} ${openState} ${disabledState}`;
  });

  protected optionClasses(option: SelectOption<T>): string {
    const base = 'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors';
    const selected = this.isSelected(option) ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-surface-raised';
    const disabled = option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    return `${base} ${selected} ${disabled}`;
  }

  protected isSelected(option: SelectOption<T>): boolean {
    const val = this.value();
    if (this.mode() === 'multiple' && Array.isArray(val)) {
      return val.includes(option.value);
    }
    return val === option.value;
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    this.isOpen.update((v) => !v);
  }
  protected close(): void { this.isOpen.set(false); this.searchQuery.set(''); }

  protected selectOption(option: SelectOption<T>): void {
    if (option.disabled) return;
    if (this.mode() === 'multiple') {
      const current = (this.value() as T[] | null) ?? [];
      const idx = current.indexOf(option.value);
      const next = idx >= 0 ? current.filter((_, i) => i !== idx) : [...current, option.value];
      this.value.set(next as T[]);
      this._onChange(next as T[]);
    } else {
      this.value.set(option.value);
      this._onChange(option.value);
      this.close();
    }
  }

  protected clearValue(event: Event): void {
    event.stopPropagation();
    const empty = this.mode() === 'multiple' ? [] : null;
    this.value.set(empty as T[] | null);
    this._onChange(empty as T[] | null);
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onBlur(): void { this._onTouched(); }

  private _onChange: (v: T | T[] | null) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(value: T | T[] | null): void { this.value.set(value); }
  registerOnChange(fn: (v: T | T[] | null) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
}
