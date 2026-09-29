import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

export type StepperOrientation = 'horizontal' | 'vertical';

/**
 * Stepper — multi-step form wizard navigation.
 *
 * Usage:
 *   <app-stepper [steps]="steps" [(activeStep)]="currentStep">
 *     @switch (currentStep) {
 *       @case ('personal') { <app-personal-form /> }
 *       @case ('company') { <app-company-form /> }
 *       @case ('review') { <app-review /> }
 *     }
 *   </app-stepper>
 *
 * Responsive: horizontal on desktop, vertical on mobile.
 */
@Component({
  selector: 'app-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="flex flex-col gap-5 w-full">
      <!-- Step indicators -->
      <nav aria-label="Progress" class="w-full overflow-x-auto no-scrollbar py-1">
        <ol class="flex items-center justify-between w-full min-w-0">
          @for (step of steps(); track step.id; let i = $index; let last = $last) {
            <li class="flex items-center flex-1 last:flex-initial min-w-0">
              <button
                type="button"
                class="flex flex-col items-center gap-1 group focus-visible:outline-none cursor-pointer shrink-0"
                [attr.aria-current]="activeStep() === step.id ? 'step' : null"
                (click)="stepClick(step, i)"
              >
                <!-- Circle -->
                <div [class]="circleClasses(i)">
                  @if (isPast(i)) {
                    <app-icon name="check" size="xs" class="text-white" />
                  } @else {
                    <span class="text-xs font-semibold leading-none">{{ i + 1 }}</span>
                  }
                </div>

                <!-- Labels -->
                <div class="text-center px-0.5 max-w-[70px] sm:max-w-none">
                  <p class="text-[11px] sm:text-xs font-medium truncate sm:whitespace-nowrap"
                     [class]="isCurrent(i) ? 'text-primary font-bold' : isPast(i) ? 'text-foreground' : 'text-muted'">
                    {{ step.label }}
                  </p>
                  @if (step.optional) {
                    <p class="text-[10px] text-muted hidden sm:block">Optional</p>
                  }
                </div>
              </button>

              <!-- Connector (not after last) -->
              @if (!last) {
                <div class="flex-1 h-0.5 mx-1.5 sm:mx-3 self-start mt-4 transition-colors"
                     [class]="isPast(i) ? 'bg-primary' : 'bg-border'"
                     aria-hidden="true">
                </div>
              }
            </li>
          }
        </ol>
      </nav>

      <!-- Step content slot -->
      <div>
        <ng-content />
      </div>

      <!-- Navigation buttons: responsive side-by-side flex layout on tablet & mobile -->
      @if (showNav()) {
        <div class="flex items-center justify-between gap-3 pt-3 border-t border-border/80 w-full">
          <button
            type="button"
            class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-border text-foreground hover:bg-surface-raised transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            [disabled]="isFirst()"
            (click)="prev()"
          >
            <span>&larr; Back</span>
          </button>

          <div class="flex-1 sm:flex-initial flex items-center justify-end">
            @if (activeStepIndex() < steps().length - 1) {
              <button
                type="button"
                class="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-xs transition-colors cursor-pointer"
                (click)="next()"
              >
                <span>Continue &rarr;</span>
              </button>
            } @else {
              <button
                type="button"
                class="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-success hover:bg-success-dark shadow-xs transition-colors cursor-pointer"
                (click)="finish()"
              >
                <app-icon name="check" size="xs" />
                <span>Finish</span>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class StepperComponent {
  steps = input.required<StepperStep[]>();
  activeStep = model<string>('');
  showNav = input(true);
  /** Allow clicking past steps to navigate back. Default: true. */
  allowBackNav = input(true);

  stepChange = output<{ step: StepperStep; index: number }>();
  finished = output<void>();

  protected readonly activeStepIndex = computed(() =>
    this.steps().findIndex(s => s.id === this.activeStep())
  );

  protected readonly isFirst = computed(() => this.activeStepIndex() === 0);

  protected isCurrent(i: number): boolean { return i === this.activeStepIndex(); }
  protected isPast(i: number): boolean { return i < this.activeStepIndex(); }

  protected circleClasses(i: number): string {
    const base = 'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors';
    if (this.isCurrent(i)) return `${base} border-primary bg-primary text-white`;
    if (this.isPast(i)) return `${base} border-primary bg-primary`;
    return `${base} border-border bg-surface text-muted`;
  }

  protected navBtnClass(disabled: boolean): string {
    const base = 'px-5 py-2 text-sm font-medium rounded-lg border border-border transition-colors';
    return disabled
      ? `${base} opacity-40 cursor-not-allowed text-muted`
      : `${base} text-foreground hover:bg-surface-raised`;
  }

  protected stepClick(step: StepperStep, i: number): void {
    if (!this.allowBackNav() || i >= this.activeStepIndex()) return;
    this.activeStep.set(step.id);
    this.stepChange.emit({ step, index: i });
  }

  protected prev(): void {
    const i = this.activeStepIndex();
    if (i > 0) {
      const prev = this.steps()[i - 1];
      this.activeStep.set(prev.id);
      this.stepChange.emit({ step: prev, index: i - 1 });
    }
  }

  protected next(): void {
    const i = this.activeStepIndex();
    if (i < this.steps().length - 1) {
      const next = this.steps()[i + 1];
      this.activeStep.set(next.id);
      this.stepChange.emit({ step: next, index: i + 1 });
    }
  }

  protected finish(): void {
    this.finished.emit();
  }
}
