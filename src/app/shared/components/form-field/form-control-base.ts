/**
 * Shared base class for ControlValueAccessor implementations.
 * Extend this to avoid boilerplate in every form control.
 *
 * Usage:
 *   export class InputComponent extends FormControlBase<string> implements ControlValueAccessor { ... }
 */
import { Directive, signal } from '@angular/core';

@Directive()
export abstract class FormControlBase<T> {
  protected readonly value = signal<T | null>(null);
  protected readonly isDisabled = signal(false);
  protected readonly isTouched = signal(false);

  private _onChange: (value: T | null) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  protected notifyChange(value: T | null): void {
    this.value.set(value);
    this._onChange(value);
  }

  protected notifyTouched(): void {
    if (!this.isTouched()) {
      this.isTouched.set(true);
      this._onTouched();
    }
  }
}
