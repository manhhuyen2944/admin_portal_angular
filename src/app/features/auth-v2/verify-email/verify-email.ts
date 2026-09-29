import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthV2LayoutComponent } from '../auth-v2-layout';
import {
  OtpInputComponent,
  ButtonComponent,
  AlertComponent,
  IconComponent,
  TranslatePipe,
} from '../../../shared';
import { AuthService } from '../../../core/services/auth.service';

/**
 * VerifyEmailV2Component — Centered card OTP Verification screen (Auth Version 2).
 */
@Component({
  selector: 'app-verify-email-v2',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    AuthV2LayoutComponent,
    OtpInputComponent,
    ButtonComponent,
    AlertComponent,
    IconComponent,
    TranslatePipe,
  ],
  template: `
    <app-auth-v2-layout
      [title]="isResetFlow() ? ('auth.verifyResetCode' | translate) : ('auth.checkEmail' | translate)"
      [subtitle]="isResetFlow()
        ? ('auth.enterCodeResetDesc' | translate)
        : ('auth.enterCodeEmailDesc' | translate)"
      [icon]="isResetFlow() ? 'shield' : 'mail'"
    >
      @if (isSuccess()) {
        <!-- Success State -->
        <div class="rounded-2xl border border-success/30 bg-success/5 p-6 text-center space-y-4">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <app-icon name="check-circle" size="lg" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-foreground">
              {{ isResetFlow() ? ('auth.codeVerifiedSuccess' | translate) : ('auth.emailVerifiedSuccess' | translate) }}
            </h3>
            <p class="text-xs text-muted mt-1">
              {{ isResetFlow()
                ? ('auth.redirectingNewPass' | translate)
                : ('auth.accountConfirmedDesc' | translate) }}
            </p>
          </div>
          <div class="pt-2">
            <app-button
              variant="primary"
              size="md"
              [fullWidth]="true"
              [routerLink]="isResetFlow() ? '/auth-v2/reset-password' : '/auth-v2/login'"
            >
              {{ isResetFlow() ? ('auth.setNewPassword' | translate) : ('auth.continueToDashboard' | translate) }}
            </app-button>
          </div>
        </div>
      } @else {
        <!-- Email Destination Banner -->
        <div class="rounded-xl border border-border bg-surface-raised/50 p-3.5 text-center">
          <p class="text-xs text-muted mb-0.5">{{ 'auth.verifyEmailDesc' | translate }}</p>
          <p class="text-xs font-semibold text-foreground tracking-tight">{{ maskedEmail() }}</p>
        </div>

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

        @if (resendSuccess()) {
          <div class="mb-4">
            <app-alert
              variant="success"
              title="A new 6-digit verification code has been dispatched to your inbox."
              [dismissible]="true"
              (dismiss)="resendSuccess.set(false)"
            />
          </div>
        }

        <!-- 6-digit OTP Box -->
        <div class="space-y-4 pt-1">
          <div class="flex justify-center">
            <app-otp-input
              #otpInputRef
              [length]="6"
              [disabled]="isLoading() || isSuccess()"
              (valueChange)="otpValue.set($event)"
              (completed)="handleOtpComplete($event)"
            />
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <app-button
              variant="primary"
              size="md"
              [fullWidth]="true"
              [loading]="isLoading()"
              [disabled]="otpValue().length < 6"
              (clicked)="handleSubmit()"
            >
              {{ 'auth.verifyCode' | translate }}
            </app-button>
          </div>

          <!-- Resend Countdown -->
          <div class="text-center pt-2 text-xs">
            <span class="text-muted">{{ 'auth.didntReceiveCode' | translate }} </span>
            @if (canResend()) {
              <button
                type="button"
                [disabled]="isResending()"
                (click)="handleResend()"
                class="font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer ml-1 inline-flex items-center gap-1"
              >
                @if (isResending()) {
                  <app-icon name="loader" size="xs" class="animate-spin" />
                }
                {{ 'auth.resendCode' | translate }}
              </button>
            } @else {
              <span class="font-mono text-muted/70">
                Resend in <span class="text-primary font-bold">{{ cooldown() }}s</span>
              </span>
            }
          </div>
        </div>
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
export class VerifyEmailV2Component implements OnInit {
  @ViewChild('otpInputRef') otpInputRef?: OtpInputComponent;

  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  emailInput = input<string | undefined>(undefined, { alias: 'email' });

  resend = output<void>();
  verifiedCheck = output<string>();

  protected currentEmail = signal('user@company.com');
  protected isResetFlow = signal(false);
  protected otpValue = signal('');
  protected isLoading = signal(false);
  protected isResending = signal(false);
  protected resendSuccess = signal(false);
  protected isSuccess = signal(false);
  protected cooldown = signal(60);
  protected canResend = signal(false);
  protected errorMessage = signal<string | null>(null);

  protected readonly maskedEmail = computed(() => {
    const raw = this.currentEmail();
    const parts = raw.split('@');
    if (parts.length !== 2) return raw;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `${name.charAt(0)}*@${domain}`;
    const head = name.slice(0, 2);
    const tail = name.slice(-1);
    return `${head}***${tail}@${domain}`;
  });

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.currentEmail.set(params['email']);
      }
      if (params['flow'] === 'reset' || params['reset'] === 'true') {
        this.isResetFlow.set(true);
      }
    });

    if (this.emailInput()) {
      this.currentEmail.set(this.emailInput()!);
    }

    this.startCooldown();
  }

  private startCooldown(): void {
    this.cooldown.set(60);
    this.canResend.set(false);

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      const current = this.cooldown();
      if (current <= 1) {
        clearInterval(this.timerInterval!);
        this.timerInterval = null;
        this.canResend.set(true);
        this.cooldown.set(0);
      } else {
        this.cooldown.set(current - 1);
      }
    }, 1000);
  }

  handleOtpComplete(code: string): void {
    this.otpValue.set(code);
    this.handleSubmit();
  }

  async handleSubmit(): Promise<void> {
    const code = this.otpValue();
    if (code.length < 6 || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.verifyOtp({ email: this.currentEmail(), code });
      this.isSuccess.set(true);
      this.verifiedCheck.emit(code);

      setTimeout(async () => {
        if (this.isResetFlow()) {
          await this.router.navigate(['/auth-v2/reset-password'], {
            queryParams: { email: this.currentEmail() },
          });
        } else {
          await this.router.navigate(['/system-design']);
        }
      }, 1500);
    } catch {
      this.errorMessage.set('Invalid or expired verification code. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleResend(): Promise<void> {
    if (!this.canResend() || this.isResending()) return;

    this.isResending.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.resendOtp(this.currentEmail());
      this.resendSuccess.set(true);
      this.resend.emit();
      this.startCooldown();
    } catch {
      this.errorMessage.set('Failed to resend verification code. Please wait and try again.');
    } finally {
      this.isResending.set(false);
    }
  }
}
