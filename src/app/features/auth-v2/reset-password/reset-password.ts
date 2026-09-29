import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthV2LayoutComponent } from '../auth-v2-layout';
import {
  FormFieldComponent,
  InputComponent,
  ButtonComponent,
  AlertComponent,
  IconComponent,
  TranslatePipe,
} from '../../../shared';
import { AuthService } from '../../../core/services/auth.service';

/**
 * ResetPasswordV2Component — Centered card Reset Password screen (Auth Version 2).
 */
@Component({
  selector: 'app-reset-password-v2',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AuthV2LayoutComponent,
    FormFieldComponent,
    InputComponent,
    ButtonComponent,
    AlertComponent,
    IconComponent,
    TranslatePipe,
  ],
  template: `
    <app-auth-v2-layout
      [title]="'auth.createNewPassword' | translate"
      [subtitle]="'auth.passwordLengthNotice' | translate"
      icon="lock"
    >
      @if (isSuccess()) {
        <!-- Success state -->
        <div class="rounded-2xl border border-success/30 bg-success/5 p-6 text-center space-y-4">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <app-icon name="check-circle" size="lg" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-foreground">{{ 'auth.passwordResetSuccess' | translate }}</h3>
            <p class="text-xs text-muted mt-1">
              {{ 'auth.passwordResetSuccessDesc' | translate }}
            </p>
          </div>
          <div class="pt-2">
            <app-button
              variant="primary"
              size="md"
              [fullWidth]="true"
              routerLink="/auth-v2/login"
            >
              {{ 'auth.signInNow' | translate }}
            </app-button>
          </div>
        </div>
      } @else {
        @if (errorMessage()) {
          <div class="mb-4">
            <app-alert
              variant="danger"
              [title]="errorMessage()!"
              [dismissible]="true"
              (dismiss)="errorMessage.set(null)"
            />
          </div>
        }

        <form (submit)="handleSubmit($event)" class="space-y-4" novalidate>
          <!-- New Password -->
          <app-form-field [label]="'auth.newPassword' | translate" [required]="true">
            <app-input
              [type]="showPassword() ? 'text' : 'password'"
              [placeholder]="'auth.passwordPlaceholder' | translate"
              [(ngModel)]="newPassword"
              name="newPassword"
              [required]="true"
              suffix="eye"
              (suffixClick)="showPassword.set(!showPassword())"
            />
          </app-form-field>

          <!-- Password Strength Meter -->
          @if (newPassword()) {
            <div class="space-y-1.5 pt-0.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted">{{ 'auth.passwordStrength' | translate }}</span>
                <span [class]="strengthLabelClass()">{{ strengthText() }}</span>
              </div>
              <div class="grid grid-cols-4 gap-1.5 h-1.5">
                <div class="rounded-full transition-all duration-300" [class]="meterBarClass(1)"></div>
                <div class="rounded-full transition-all duration-300" [class]="meterBarClass(2)"></div>
                <div class="rounded-full transition-all duration-300" [class]="meterBarClass(3)"></div>
                <div class="rounded-full transition-all duration-300" [class]="meterBarClass(4)"></div>
              </div>
            </div>
          }

          <!-- Confirm Password -->
          <app-form-field [label]="'auth.confirmPassword' | translate" [required]="true">
            <app-input
              [type]="showConfirmPassword() ? 'text' : 'password'"
              [placeholder]="'auth.passwordPlaceholder' | translate"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              [required]="true"
              suffix="eye"
              (suffixClick)="showConfirmPassword.set(!showConfirmPassword())"
            />
          </app-form-field>

          <!-- Validation hints -->
          <div class="space-y-1 text-xs text-muted pt-1">
            <div class="flex items-center gap-1.5">
              <app-icon
                [name]="hasMinLength() ? 'check' : 'circle'"
                size="xs"
                [class]="hasMinLength() ? 'text-success' : 'text-muted'"
              />
              <span>At least 8 characters</span>
            </div>
            <div class="flex items-center gap-1.5">
              <app-icon
                [name]="hasMatch() ? 'check' : 'circle'"
                size="xs"
                [class]="hasMatch() ? 'text-success' : 'text-muted'"
              />
              <span>Passwords match</span>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <app-button
              type="submit"
              variant="primary"
              size="md"
              [fullWidth]="true"
              [loading]="isLoading()"
              [disabled]="!isValid()"
            >
              {{ 'auth.resetPassword' | translate }}
            </app-button>
          </div>
        </form>
      }

      <div auth-footer class="space-y-2">
        <p>
          {{ 'auth.backToSignIn' | translate }}?
          <a
            routerLink="/auth-v2/login"
            class="font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer ml-1"
          >
            {{ 'auth.signIn' | translate }}
          </a>
        </p>
      </div>
    </app-auth-v2-layout>
  `,
})
export class ResetPasswordV2Component implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected email = signal<string>('');
  protected newPassword = signal('');
  protected confirmPassword = signal('');
  protected showPassword = signal(false);
  protected showConfirmPassword = signal(false);
  protected isLoading = signal(false);
  protected isSuccess = signal(false);
  protected errorMessage = signal<string | null>(null);

  passwordReset = output<string>();

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email.set(params['email']);
      }
    });
  }

  protected readonly hasMinLength = computed(() => this.newPassword().length >= 8);
  protected readonly hasMatch = computed(() => {
    return this.newPassword().length > 0 && this.newPassword() === this.confirmPassword();
  });
  protected readonly isValid = computed(() => this.hasMinLength() && this.hasMatch());

  protected readonly strengthScore = computed(() => {
    const p = this.newPassword();
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  });

  protected readonly strengthText = computed(() => {
    switch (this.strengthScore()) {
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  });

  protected strengthLabelClass(): string {
    switch (this.strengthScore()) {
      case 1: return 'font-semibold text-danger';
      case 2: return 'font-semibold text-warning';
      case 3:
      case 4: return 'font-semibold text-success';
      default: return 'text-muted';
    }
  }

  protected meterBarClass(barIndex: number): string {
    const score = this.strengthScore();
    if (score < barIndex) return 'bg-border/40';
    if (score === 1) return 'bg-danger';
    if (score === 2) return 'bg-warning';
    return 'bg-success';
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.isValid() || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.resetPassword({
        email: this.email() || undefined,
        newPassword: this.newPassword(),
      });
      this.isSuccess.set(true);
      this.passwordReset.emit(this.newPassword());
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
