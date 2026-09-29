import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  model,
  output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * OtpInputComponent — 6 individual digit boxes with auto-focus, paste support, backspace navigation.
 *
 * Usage:
 *   <app-otp-input (completed)="onComplete($event)" />
 *   <app-otp-input [length]="4" type="alphanumeric" />
 */
@Component({
  selector: 'app-otp-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 sm:gap-3 justify-center">
      @for (i of indices(); track i) {
        <input
          #otpInput
          type="text"
          [attr.inputmode]="type() === 'number' ? 'numeric' : 'text'"
          maxlength="1"
          [value]="digits()[i]"
          [disabled]="disabled()"
          [placeholder]="placeholder()"
          [attr.aria-label]="'Digit ' + (i + 1) + ' of ' + length()"
          [class]="inputClass(i)"
          autocomplete="one-time-code"
          (input)="onInput($event, i)"
          (keydown)="onKeydown($event, i)"
          (focus)="onFocus($event, i)"
          (paste)="onPaste($event, i)"
        />
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class OtpInputComponent implements AfterViewInit {
  @ViewChildren('otpInput') inputEls!: QueryList<ElementRef<HTMLInputElement>>;

  length     = input(6);
  type       = input<'number' | 'alphanumeric'>('number');
  disabled   = input(false);
  placeholder = input('·');

  completed   = output<string>();
  valueChange = output<string>();

  private readonly cdr = inject(ChangeDetectorRef);

  protected digits = model<string[]>([]);

  protected get indices(): () => number[] {
    return () => Array.from({ length: this.length() }, (_, i) => i);
  }

  ngAfterViewInit(): void {
    this.digits.set(Array(this.length()).fill(''));
  }

  protected inputClass(index: number): string {
    const base = [
      'w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 text-center text-lg sm:text-xl font-bold',
      'bg-surface text-foreground transition-all duration-150 outline-none select-none',
      'placeholder:text-border/60 focus:placeholder:text-transparent',
      'caret-primary',
    ].join(' ');

    const filled = this.digits()[index] !== '';
    const focusRing = 'focus:border-primary focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.15)]';
    const filledCls = filled
      ? 'border-primary/60 bg-primary/5 shadow-[0_0_0_1px_oklch(var(--primary)/0.15)]'
      : 'border-border hover:border-border-hover';
    const disabledCls = this.disabled() ? 'opacity-50 cursor-not-allowed' : 'cursor-text';

    return `${base} ${focusRing} ${filledCls} ${disabledCls}`;
  }

  protected onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const char = this.filterChar(raw.slice(-1));

    const newDigits = [...this.digits()];
    newDigits[index] = char;
    this.digits.set(newDigits);
    input.value = char;

    this.emit();

    if (char && index < this.length() - 1) {
      this.focusAt(index + 1);
    }
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const newDigits = [...this.digits()];
      if (newDigits[index]) {
        newDigits[index] = '';
        this.digits.set(newDigits);
        this.emit();
      } else if (index > 0) {
        newDigits[index - 1] = '';
        this.digits.set(newDigits);
        this.emit();
        this.focusAt(index - 1);
      }
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusAt(index - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && index < this.length() - 1) {
      this.focusAt(index + 1);
      event.preventDefault();
    }
  }

  protected onFocus(event: FocusEvent, _index: number): void {
    (event.target as HTMLInputElement).select();
  }

  protected onPaste(event: ClipboardEvent, startIndex: number): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const filtered = pasted.split('').map(c => this.filterChar(c)).filter(Boolean);
    const newDigits = [...this.digits()];

    let lastFilled = startIndex;
    filtered.forEach((char, i) => {
      const pos = startIndex + i;
      if (pos < this.length()) {
        newDigits[pos] = char;
        lastFilled = pos;
      }
    });

    this.digits.set(newDigits);
    this.emit();

    const focusNext = Math.min(lastFilled + 1, this.length() - 1);
    this.focusAt(focusNext);
    this.cdr.markForCheck();
  }

  private filterChar(c: string): string {
    if (this.type() === 'number') return /^\d$/.test(c) ? c : '';
    return /^[a-zA-Z0-9]$/.test(c) ? c.toUpperCase() : '';
  }

  private focusAt(index: number): void {
    const el = this.inputEls?.get(index)?.nativeElement;
    if (el) setTimeout(() => el.focus(), 0);
  }

  private emit(): void {
    const value = this.digits().join('');
    this.valueChange.emit(value);
    if (value.length === this.length() && !value.includes('')) {
      this.completed.emit(value);
    }
  }

  /** Public API: reset all digits */
  public reset(): void {
    this.digits.set(Array(this.length()).fill(''));
    this.focusAt(0);
    this.emit();
  }
}
