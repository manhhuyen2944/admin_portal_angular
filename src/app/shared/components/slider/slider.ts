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
 * Slider — range slider input.
 *
 * Usage:
 *   <app-slider formControlName="volume" [min]="0" [max]="100" [step]="5" />
 *   <app-slider formControlName="opacity" [min]="0" [max]="1" [step]="0.1" [showValue]="true" />
 */
@Component({
  selector: 'app-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SliderComponent),
    multi: true,
  }],
  styles: [`
    input[type=range] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 9999px;
      background: transparent;
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-primary);
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      transition: transform 150ms;
    }
    input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.15);
    }
    input[type=range]:disabled::-webkit-slider-thumb {
      opacity: 0.5;
      cursor: not-allowed;
    }
    input[type=range]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-primary);
      cursor: pointer;
      border: 2px solid white;
    }
  `],
  template: `
    <div class="flex flex-col gap-2 w-full">
      <div class="flex items-center justify-between">
        @if (label()) {
          <span class="text-sm font-medium text-foreground">{{ label() }}</span>
        }
        @if (showValue()) {
          <span class="text-sm font-semibold text-primary tabular-nums">{{ value() }}</span>
        }
      </div>

      <div class="relative flex items-center w-full h-5">
        <!-- Track -->
        <div class="absolute left-0 right-0 h-1.5 rounded-full bg-border overflow-hidden">
          <div class="h-full rounded-full bg-primary transition-all" [style.width]="fillPercent() + '%'"></div>
        </div>

        <!-- Native range -->
        <input
          type="range"
          class="relative z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="value()"
          [disabled]="isDisabled()"
          (input)="handleInput($event)"
          (blur)="handleBlur()"
        />
      </div>

      @if (showMinMax()) {
        <div class="flex justify-between text-xs text-muted">
          <span>{{ min() }}</span>
          <span>{{ max() }}</span>
        </div>
      }
    </div>
  `,
})
export class SliderComponent implements ControlValueAccessor {
  min = input(0);
  max = input(100);
  step = input(1);
  label = input<string | undefined>(undefined);
  showValue = input(false);
  showMinMax = input(false);

  protected readonly value = signal(0);
  protected readonly isDisabled = signal(false);

  protected readonly fillPercent = computed(() => {
    const range = this.max() - this.min();
    if (range === 0) return 0;
    return ((this.value() - this.min()) / range) * 100;
  });

  private _onChange: (v: number) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(value: number | null): void { this.value.set(value ?? this.min()); }
  registerOnChange(fn: (v: number) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }

  protected handleInput(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.value.set(val);
    this._onChange(val);
  }
  protected handleBlur(): void { this._onTouched(); }
}
