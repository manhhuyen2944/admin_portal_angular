import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RadioOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Radio — radio group with ControlValueAccessor.
 *
 * Usage:
 *   <app-radio [options]="roleOptions" formControlName="role" />
 *   <app-radio [options]="sizeOptions" formControlName="size" [inline]="true" />
 */
@Component({
  selector: 'app-radio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RadioComponent),
    multi: true,
  }],
  template: `
    <div
      role="radiogroup"
      [class]="inline() ? 'flex flex-wrap gap-4' : 'flex flex-col gap-3'"
    >
      @for (option of options(); track option.value) {
        <label
          class="inline-flex items-start gap-3 cursor-pointer group"
          [class.opacity-50]="isDisabled() || option.disabled"
          [class.cursor-not-allowed]="isDisabled() || option.disabled"
        >
          <div class="relative flex h-5 w-5 shrink-0 mt-px">
            <input
              type="radio"
              class="sr-only"
              [name]="name()"
              [value]="option.value"
              [checked]="value() === option.value"
              [disabled]="isDisabled() || !!option.disabled"
              (change)="handleChange(option.value)"
              (blur)="handleBlur()"
            />
            <!-- Custom radio circle -->
            <div
              class="flex h-5 w-5 items-center justify-center rounded-full border-2
                     transition-all duration-150"
              [class]="value() === option.value
                ? 'border-primary'
                : 'border-border group-hover:border-primary/60'"
              aria-hidden="true"
            >
              @if (value() === option.value) {
                <div class="h-2.5 w-2.5 rounded-full bg-primary transition-transform scale-in"></div>
              }
            </div>
          </div>

          <div class="min-w-0">
            <span class="text-sm font-medium text-foreground leading-5 select-none">
              {{ option.label }}
            </span>
            @if (option.description) {
              <p class="text-xs text-muted mt-0.5">{{ option.description }}</p>
            }
          </div>
        </label>
      }
    </div>
  `,
})
export class RadioComponent<T = string> implements ControlValueAccessor {
  options = input<RadioOption<T>[]>([]);
  /** Group name for native radio inputs — should be unique per form. */
  name = input<string>('radio-group');
  inline = input(false);

  protected readonly value = signal<T | null>(null);
  protected readonly isDisabled = signal(false);

  private _onChange: (v: T | null) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(value: T | null): void { this.value.set(value); }
  registerOnChange(fn: (v: T | null) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }

  protected handleChange(val: T): void {
    this.value.set(val);
    this._onChange(val);
  }
  protected handleBlur(): void { this._onTouched(); }
}
