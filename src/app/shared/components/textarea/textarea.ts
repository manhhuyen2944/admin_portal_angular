import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Textarea — multi-line text input with ControlValueAccessor.
 *
 * Usage:
 *   <app-form-field label="Description">
 *     <app-textarea formControlName="description" placeholder="Enter description..." [rows]="4" />
 *   </app-form-field>
 */
@Component({
  selector: 'app-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextareaComponent),
    multi: true,
  }],
  template: `
    <textarea
      [id]="id()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [readonly]="readonly()"
      [required]="required()"
      [rows]="rows()"
      [class]="classes()"
      [attr.aria-describedby]="ariaDescribedBy() || null"
      [attr.aria-invalid]="hasError() || null"
      [attr.maxlength]="maxLength() || null"
      (input)="handleInput($event)"
      (blur)="handleBlur()"
    >{{ value() }}</textarea>

    @if (maxLength() && showCount()) {
      <div class="flex justify-end mt-1">
        <span class="text-xs text-muted">{{ (value() ?? '').length }} / {{ maxLength() }}</span>
      </div>
    }
  `,
})
export class TextareaComponent implements ControlValueAccessor {
  id = input<string | undefined>(undefined);
  placeholder = input('');
  rows = input(3);
  readonly = input(false);
  required = input(false);
  hasError = input(false);
  maxLength = input<number | undefined>(undefined);
  showCount = input(false);
  ariaDescribedBy = input<string | undefined>(undefined);

  protected readonly value = signal('');
  protected readonly isDisabled = signal(false);

  protected readonly classes = computed(() => {
    const base = [
      'w-full rounded-md border bg-surface text-foreground text-sm px-3 py-2.5',
      'placeholder:text-muted resize-y min-h-[80px]',
      'transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-raised',
      'read-only:bg-surface-raised read-only:cursor-default',
    ].join(' ');
    const border = this.hasError()
      ? 'border-danger focus:ring-danger/40 focus:border-danger'
      : 'border-border';
    return `${base} ${border}`;
  });

  private _onChange: (v: string) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(value: string | null): void { this.value.set(value ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }

  protected handleInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value.set(val);
    this._onChange(val);
  }

  protected handleBlur(): void { this._onTouched(); }
}
