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

/**
 * Switch — toggle switch for boolean settings.
 *
 * Usage:
 *   <app-switch formControlName="notifications" label="Email notifications" />
 *   <app-switch [(checked)]="isActive" label="Active" />
 */
@Component({
  selector: 'app-switch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SwitchComponent),
    multi: true,
  }],
  template: `
    <label
      class="inline-flex items-center gap-3 cursor-pointer group"
      [class.flex-row-reverse]="labelPosition() === 'left'"
      [class.opacity-50]="isDisabled()"
      [class.cursor-not-allowed]="isDisabled()"
    >
      <!-- Track + thumb -->
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="label() || undefined"
        [disabled]="isDisabled()"
        [class]="trackClasses()"
        (click)="toggle()"
        (blur)="handleBlur()"
      >
        <span [class]="thumbClasses()"></span>
      </button>

      <!-- Label + description -->
      @if (label()) {
        <div class="min-w-0">
          <span class="text-sm font-medium text-foreground select-none">{{ label() }}</span>
          @if (description()) {
            <p class="text-xs text-muted mt-0.5">{{ description() }}</p>
          }
        </div>
      }
    </label>
  `,
})
export class SwitchComponent implements ControlValueAccessor {
  label = input<string | undefined>(undefined);
  description = input<string | undefined>(undefined);
  labelPosition = input<'left' | 'right'>('right');
  checked = model(false);

  protected readonly isDisabled = signal(false);

  protected readonly trackClasses = computed(() => {
    const base = [
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full',
      'transition-colors duration-200 ease-in-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      'disabled:pointer-events-none',
    ].join(' ');
    return `${base} ${this.checked() ? 'bg-primary' : 'bg-border'}`;
  });

  protected readonly thumbClasses = computed(() => {
    const base = [
      'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm',
      'ring-0 transition-transform duration-200 ease-in-out',
    ].join(' ');
    return `${base} ${this.checked() ? 'translate-x-6' : 'translate-x-1'}`;
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

  protected toggle(): void {
    if (this.isDisabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this._onChange(next);
  }

  protected handleBlur(): void { this._onTouched(); }
}
