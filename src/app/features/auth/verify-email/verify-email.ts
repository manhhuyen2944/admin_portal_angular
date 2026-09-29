import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout';
import { OtpInputComponent } from '../../../shared/components/otp-input/otp-input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { IconComponent } from '../../../shared/components/icon/icon';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

/**
 * VerifyEmailComponent — UI View Controller for OTP code verification.
 * Delegates OTP verification and resend logic to AuthService.
 */
@Component({
  selector: 'app-verify-email',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    AuthLayoutComponent,
    OtpInputComponent,
    ButtonComponent,
    AlertComponent,
    IconComponent,
    TranslatePipe,
  ],
  templateUrl: './verify-email.html',
})
export class VerifyEmailComponent implements OnInit {
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
  protected errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.currentEmail.set(params['email']);
      } else if (this.emailInput()) {
        this.currentEmail.set(this.emailInput()!);
      }

      if (params['type'] === 'reset-password') {
        this.isResetFlow.set(true);
      }
    });

    this.startCooldown();
  }

  protected maskedEmail(): string {
    const e = this.currentEmail();
    const [local, domain] = e.split('@');
    if (!local || !domain) return e;
    const masked = local[0] + '*'.repeat(Math.max(local.length - 2, 2)) + (local.length > 1 ? local.slice(-1) : '') + '@' + domain;
    return masked;
  }

  protected onOtpChange(value: string): void {
    this.otpValue.set(value);
    if (this.errorMessage()) this.errorMessage.set(null);
  }

  protected onOtpComplete(value: string): void {
    this.otpValue.set(value);
    this.handleVerify();
  }

  async handleVerify(): Promise<void> {
    if (this.otpValue().length < 6 || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.verifyOtp({
        email: this.currentEmail(),
        code: this.otpValue(),
        type: this.isResetFlow() ? 'reset-password' : 'email-verification',
      });

      this.isSuccess.set(true);
      this.verifiedCheck.emit(this.otpValue());

      // If reset-password flow, navigate to /auth/reset-password after 600ms
      if (this.isResetFlow()) {
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], {
            queryParams: { email: this.currentEmail() },
          });
        }, 600);
      }
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Invalid code.');
      this.otpInputRef?.reset();
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleResend(): Promise<void> {
    if (this.cooldown() > 0 || this.isResending()) return;

    this.isResending.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.resendOtp(this.currentEmail());
      this.resendSuccess.set(true);
      this.startCooldown();
      this.resend.emit();
      this.otpInputRef?.reset();
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to resend code.');
    } finally {
      this.isResending.set(false);
    }
  }

  private startCooldown(): void {
    this.cooldown.set(60);
    const timer = setInterval(() => {
      this.cooldown.update(c => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }
}
