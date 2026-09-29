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

export type InputType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'currency';

export type InputSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'h-8 text-base lg:text-sm px-3',
  md: 'h-10 text-base lg:text-sm px-3',
  lg: 'h-12 text-base px-4',
};

/**
 * Input — single text input component for all text-like inputs.
 *
 * The `type` prop handles: text, password, email, number, tel, url, search, currency.
 * Do NOT create SearchInput2, PasswordInput as separate components — use type/config.
 *
 * Usage:
 *   <!-- Basic: -->
 *   <app-input formControlName="name" placeholder="Enter name" />
 *
 *   <!-- In FormField: -->
 *   <app-form-field label="Email" id="email">
 *     <app-input id="email" type="email" formControlName="email" />
 *   </app-form-field>
 *
 *   <!-- With prefix/suffix icons: -->
 *   <app-input type="search" prefix="search" placeholder="Search..." />
 *   <app-input type="password" suffix="eye" />
 *
 *   <!-- Currency: -->
 *   <app-input type="currency" [prefixText]="'$'" formControlName="price" />
 *
 * Responsive: always full-width (w-full) — column grid applied by FormField / page layout.
 */
@Component({
  selector: 'app-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    class: 'block w-full',
  },
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true,
  }],
  template: `
    <div class="relative flex items-center w-full">
      <!-- Prefix icon -->
      @if (prefix()) {
        <div class="pointer-events-none absolute left-3 flex items-center text-muted">
          <app-icon [name]="prefix()!" size="sm" />
        </div>
      }

      <!-- Prefix text (e.g. currency symbol) -->
      @if (prefixText() && !prefix()) {
        <div class="pointer-events-none absolute left-3 text-base lg:text-sm text-muted select-none">
          {{ prefixText() }}
        </div>
      }

      <!-- The actual input -->
      <input
        [id]="id()"
        [type]="resolvedType()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [readonly]="readonly()"
        [required]="required()"
        [autocomplete]="autocomplete()"
        [value]="value() ?? ''"
        [class]="inputClasses()"
        [attr.aria-describedby]="ariaDescribedBy() || null"
        [attr.aria-invalid]="hasError() || null"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />

      <!-- Toggle password visibility -->
      @if (type() === 'password') {
        <button
          type="button"
          class="absolute right-3 flex items-center text-muted hover:text-foreground transition-colors"
          [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
          (click)="togglePassword()"
        >
          <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" size="sm" />
        </button>
      }

      <!-- Suffix icon (non-password) -->
      @if (suffix() && type() !== 'password') {
        <div class="pointer-events-none absolute right-3 flex items-center text-muted">
          <app-icon [name]="suffix()!" size="sm" />
        </div>
      }

      <!-- Loading spinner -->
      @if (loading()) {
        <div class="absolute right-3 flex items-center text-muted">
          <app-icon name="loader" size="sm" class="animate-spin" />
        </div>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  id = input<string | undefined>(undefined);
  type = input<InputType>('text');
  size = input<InputSize>('md');
  placeholder = input('');
  readonly = input(false);
  required = input(false);
  loading = input(false);
  hasError = input(false);
  autocomplete = input<string>('off');
  ariaDescribedBy = input<string | undefined>(undefined);

  /** Leading icon name */
  prefix = input<IconName | undefined>(undefined);
  /** Leading text (e.g. '$' for currency). Takes precedence over prefix icon. */
  prefixText = input<string | undefined>(undefined);
  /** Trailing icon name (ignored for password type — eye toggle takes priority). */
  suffix = input<IconName | undefined>(undefined);

  protected readonly value = signal<string>('');
  protected readonly isDisabled = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly resolvedType = computed(() => {
    if (this.type() === 'password') return this.showPassword() ? 'text' : 'password';
    if (this.type() === 'currency') return 'number';
    return this.type();
  });

  protected readonly inputClasses = computed(() => {
    const base = [
      'w-full rounded-md border bg-surface text-foreground',
      'placeholder:text-muted',
      'transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-raised',
      'read-only:bg-surface-raised read-only:cursor-default',
    ].join(' ');

    const border = this.hasError()
      ? 'border-danger focus:ring-danger/40 focus:border-danger'
      : 'border-border';

    const size = SIZE_CLASSES[this.size()];
    const pl = (this.prefix() || this.prefixText()) ? 'pl-9' : '';
    const pr = (this.suffix() || this.type() === 'password' || this.loading()) ? 'pr-9' : '';

    return [base, border, size, pl, pr].filter(Boolean).join(' ');
  });

  private _onChange: (v: string) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }
  registerOnChange(fn: (v: string) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }

  protected handleInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this._onChange(val);
  }

  protected handleBlur(): void {
    this._onTouched();
  }

  protected togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
