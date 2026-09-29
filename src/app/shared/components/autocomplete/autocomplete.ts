import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';

export interface AutocompleteOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Autocomplete — typeahead input with async option support.
 *
 * For local filtering: pass [options] and set [mode]="'local'".
 * For async: set [mode]="'async'" and handle (queryChange) in the parent, then update [options].
 *
 * Usage:
 *   <!-- Local: -->
 *   <app-autocomplete [options]="users" formControlName="userId" placeholder="Search users..." />
 *
 *   <!-- Async: -->
 *   <app-autocomplete
 *     mode="async"
 *     [options]="searchResults"
 *     [loading]="isSearching"
 *     (queryChange)="searchUsers($event)"
 *     formControlName="userId"
 *   />
 */
@Component({
  selector: 'app-autocomplete',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutocompleteComponent),
    multi: true,
  }],
  template: `
    <div class="relative w-full" (keydown.escape)="close()">
      <!-- Input -->
      <div class="relative">
        <div class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <app-icon name="search" size="sm" />
        </div>
        <input
          #inputEl
          type="text"
          [id]="id()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [value]="inputValue()"
          [class]="inputClasses()"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-autocomplete]="'list'"
          [attr.aria-haspopup]="'listbox'"
          [attr.aria-invalid]="hasError() || null"
          autocomplete="off"
          (input)="handleInput($event)"
          (focus)="handleFocus()"
          (blur)="handleBlur()"
          (keydown.arrowDown)="focusNext($event)"
          (keydown.enter)="selectFocused($event)"
        />
        @if (loading()) {
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <app-icon name="loader" size="sm" class="text-muted animate-spin" />
          </div>
        } @else if (inputValue() && !isDisabled()) {
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            aria-label="Clear"
            (click)="clear()"
          >
            <app-icon name="x" size="xs" />
          </button>
        }
      </div>

      <!-- Options dropdown -->
      @if (isOpen() && (filteredOptions().length > 0 || (!loading() && mode() === 'async'))) {
        <div class="fixed inset-0 z-[var(--z-dropdown)]" (click)="close()"></div>
        <div
          class="absolute left-0 right-0 top-full mt-1 z-[calc(var(--z-dropdown)+1)]
                 rounded-lg border border-border bg-surface shadow-lg overflow-hidden"
          role="listbox"
        >
          <div class="max-h-60 overflow-y-auto py-1">
            @if (filteredOptions().length === 0 && !loading()) {
              <div class="px-3 py-6 text-center text-sm text-muted">No results found</div>
            }
            @for (option of filteredOptions(); track option.value; let i = $index) {
              <button
                type="button"
                [disabled]="option.disabled"
                [class]="optionClasses(i)"
                role="option"
                [attr.aria-selected]="value() === option.value"
                (click)="selectOption(option)"
                (mouseenter)="focusedIndex.set(i)"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium truncate">{{ option.label }}</p>
                  @if (option.description) {
                    <p class="text-xs text-muted truncate">{{ option.description }}</p>
                  }
                </div>
                @if (value() === option.value) {
                  <app-icon name="check" size="sm" class="text-primary shrink-0" />
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AutocompleteComponent<T = string> implements ControlValueAccessor {
  options = input<AutocompleteOption<T>[]>([]);
  mode = input<'local' | 'async'>('local');
  placeholder = input('Search...');
  loading = input(false);
  hasError = input(false);
  id = input<string | undefined>(undefined);
  /** Min characters to trigger query. Default: 1. */
  minChars = input(1);

  /** Emitted when the input query changes (for async mode). */
  queryChange = output<string>();

  protected readonly value = signal<T | null>(null);
  protected readonly isDisabled = signal(false);
  protected readonly inputValue = signal('');
  protected readonly isOpen = signal(false);
  protected readonly focusedIndex = signal(-1);

  protected readonly filteredOptions = computed(() => {
    if (this.mode() === 'async') return this.options();
    const q = this.inputValue().toLowerCase();
    if (q.length < this.minChars()) return [];
    return this.options().filter(o => o.label.toLowerCase().includes(q));
  });

  protected readonly inputClasses = computed(() => {
    const base = [
      'w-full h-10 rounded-md border bg-surface text-base lg:text-sm text-foreground pl-9',
      'placeholder:text-muted pr-9',
      'transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ');
    const border = this.hasError() ? 'border-danger' : 'border-border';
    return `${base} ${border}`;
  });

  protected optionClasses(index: number): string {
    const base = 'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors';
    const hover = index === this.focusedIndex() ? 'bg-surface-raised' : 'hover:bg-surface-raised';
    return `${base} ${hover}`;
  }

  protected handleInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.inputValue.set(q);
    this.isOpen.set(q.length >= this.minChars());
    if (this.mode() === 'async' && q.length >= this.minChars()) {
      this.queryChange.emit(q);
    }
    if (!q) {
      this.value.set(null);
      this._onChange(null);
    }
  }

  protected handleFocus(): void {
    if (this.inputValue().length >= this.minChars()) {
      this.isOpen.set(true);
    }
  }

  protected handleBlur(): void {
    setTimeout(() => {
      this.close();
      this._onTouched();
    }, 150);
  }

  protected selectOption(option: AutocompleteOption<T>): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.inputValue.set(option.label);
    this._onChange(option.value);
    this.close();
  }

  protected close(): void { this.isOpen.set(false); this.focusedIndex.set(-1); }

  protected clear(): void {
    this.inputValue.set('');
    this.value.set(null);
    this._onChange(null);
    this.close();
  }

  protected focusNext(event: Event): void {
    event.preventDefault();
    const max = this.filteredOptions().length - 1;
    this.focusedIndex.update(i => Math.min(i + 1, max));
  }

  protected selectFocused(event: Event): void {
    const idx = this.focusedIndex();
    const opts = this.filteredOptions();
    if (idx >= 0 && idx < opts.length) {
      event.preventDefault();
      this.selectOption(opts[idx]);
    }
  }

  private _onChange: (v: T | null) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(value: T | null): void {
    this.value.set(value);
    const label = this.options().find(o => o.value === value)?.label ?? '';
    this.inputValue.set(label);
  }
  registerOnChange(fn: (v: T | null) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
}
