import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * FormField — label + hint + error wrapper for any form control.
 * Wraps any shared control (Input, Select, Checkbox…) and provides
 * consistent label, hint, and error display.
 *
 * Usage:
 *   <app-form-field label="Email" [required]="true" hint="We'll never share it.">
 *     <app-input type="email" formControlName="email" />
 *   </app-form-field>
 *
 *   <!-- With error: -->
 *   <app-form-field label="Password" [error]="passwordError">
 *     <app-input type="password" formControlName="password" />
 *   </app-form-field>
 *
 * Responsive:
 *   Mobile  — label stacked above control (block layout, full width)
 *   Desktop — label still stacked (horizontal layout optional via [inline])
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  template: `
    <div [class]="containerClass()">
      <!-- Label -->
      @if (label()) {
        <label
          [for]="fieldId()"
          class="block text-sm font-medium text-foreground mb-1.5"
        >
          {{ label() }}
          @if (required()) {
            <span class="text-danger ml-0.5" aria-hidden="true">*</span>
          }
        </label>
      }

      <!-- Control slot -->
      <ng-content />

      <!-- Hint -->
      @if (hint() && !error()) {
        <p class="mt-1.5 text-xs text-muted" [id]="hintId()">
          {{ hint() }}
        </p>
      }

      <!-- Error -->
      @if (error()) {
        <p class="mt-1.5 text-xs text-danger flex items-center gap-1" [id]="errorId()" role="alert">
          <svg class="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm0 8.25a.75.75 0 110 1.5.75.75 0 010-1.5zM6 3a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 016 3z"/>
          </svg>
          {{ error() }}
        </p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  /** Label text shown above the control. */
  label = input<string | undefined>(undefined);

  /** Forwarded to the label's `for` attribute for a11y association. */
  fieldId = input<string | undefined>(undefined);

  /** Helper text shown below the control when there is no error. */
  hint = input<string | undefined>(undefined);

  /** Error message. When set, replaces hint and applies error styling. */
  error = input<string | undefined>(undefined);

  /** Appends a red asterisk to the label. Does NOT add HTML required automatically. */
  required = input(false);

  /** Stack label+control vertically (default) or inline for wider screens. */
  inline = input(false);

  protected readonly hintId = computed(() => this.fieldId() ? `${this.fieldId()}-hint` : undefined);
  protected readonly errorId = computed(() => this.fieldId() ? `${this.fieldId()}-error` : undefined);

  protected readonly containerClass = computed(() =>
    this.inline()
      ? 'flex flex-col sm:flex-row sm:items-start sm:gap-4'
      : 'flex flex-col w-full'
  );
}
