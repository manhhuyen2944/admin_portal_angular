import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';

/**
 * Checkbox — single checkbox with ControlValueAccessor.
 *
 * Usage:
 *   <app-checkbox formControlName="agree" label="I agree to the terms" />
 *   <app-checkbox formControlName="notify" label="Email notifications" [indeterminate]="true" />
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CheckboxComponent),
    multi: true,
  }],
  template: `
    <label class="inline-flex items-start gap-3 cursor-pointer group"
           [class.opacity-50]="isDisabled()"
           [class.cursor-not-allowed]="isDisabled()">
      <!-- Custom checkbox box -->
      <div class="relative flex h-5 w-5 shrink-0 mt-px">
        <input
          type="checkbox"
          class="sr-only"
          [id]="id()"
          [checked]="checked()"
          [disabled]="isDisabled()"
          [required]="required()"
          [indeterminate]="indeterminate()"
          (change)="handleChange($event)"
          (blur)="handleBlur()"
        />
        <div [class]="boxClasses()" aria-hidden="true">
          @if (indeterminate() && !checked()) {
            <span class="block h-0.5 w-2.5 bg-white rounded-full"></span>
          } @else if (checked()) {
            <app-icon name="check" size="xs" class="text-white" />
          }
        </div>
      </div>

      <!-- Label + description -->
      @if (label()) {
        <div class="min-w-0">
          <span class="text-sm font-medium text-foreground leading-5 select-none">{{ label() }}</span>
          @if (description()) {
            <p class="text-xs text-muted mt-0.5">{{ description() }}</p>
          }
        </div>
      }
    </label>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  id = input<string | undefined>(undefined);
  label = input<string | undefined>(undefined);
  description = input<string | undefined>(undefined);
  required = input(false);
  indeterminate = input(false);
  checked = model(false);

  protected readonly isDisabled = signal(false);

  protected readonly boxClasses = computed(() => {
    const base = 'flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-150';
    const active = this.checked() || this.indeterminate()
      ? 'bg-primary border-primary'
      : 'bg-surface border-border group-hover:border-primary/60';
    return `${base} ${active}`;
  });

  private _onChange: (v: boolean) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(value: boolean | null): void {
    if (value !== null && value !== undefined) {
      this.checked.set(!!value);
    }
  }
  registerOnChange(fn: (v: boolean) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }

  protected handleChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.checked.set(isChecked);
    this._onChange(isChecked);
  }

  protected handleBlur(): void { this._onTouched(); }
}
