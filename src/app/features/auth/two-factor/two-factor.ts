import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout';
import { OtpInputComponent } from '../../../shared/components/otp-input/otp-input';
import { QrCodeComponent } from '../../../shared/components/qr-code/qr-code';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { IconComponent } from '../../../shared/components/icon/icon';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

export type TwoFactorTab = 'code' | 'qr';

/**
 * TwoFactorComponent — UI View Controller for 2FA verification and pairing.
 * Verification & activation logic delegated to AuthService.
 * Tab 'code': Enter 6-digit TOTP authentication code or recovery code.
 * Tab 'qr': Scan QR code via mobile authenticator with real-time pairing status.
 */
@Component({
  selector: 'app-two-factor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AuthLayoutComponent,
    OtpInputComponent,
    QrCodeComponent,
    FormFieldComponent,
    InputComponent,
    ButtonComponent,
    AlertComponent,
    IconComponent,
    TranslatePipe,
  ],
  templateUrl: './two-factor.html',
})
export class TwoFactorComponent {
  protected readonly otpInputRef = viewChild<OtpInputComponent>('otpInputRef');

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  verifyCode = output<string>();
  activate2fa = output<string>();

  protected activeTab = signal<TwoFactorTab>('code');
  protected totpCode = signal('');
  protected backupCode = signal('');
  protected useRecoveryCode = signal(false);
  protected isLoading = signal(false);
  protected isSuccess = signal(false);
  protected errorMessage = signal<string | null>(null);

  // Authenticator Pairing Credentials (demo)
  protected readonly manualSecretKey = 'JBSW-Y3DP-EHPK-3PXP';
  protected readonly qrAuthUri =
    'otpauth://totp/AdminPortal:alex.morgan@company.com?secret=JBSWY3DPEHPK3PXP&issuer=AdminPortal';

  protected switchTab(tab: TwoFactorTab): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.useRecoveryCode.set(false);
    this.totpCode.set('');
    this.backupCode.set('');
  }

  protected toggleRecoveryCode(enable: boolean): void {
    this.useRecoveryCode.set(enable);
    this.errorMessage.set(null);
    this.totpCode.set('');
    this.backupCode.set('');
  }

  protected onOtpChange(val: string): void {
    this.totpCode.set(val);
    if (this.errorMessage()) this.errorMessage.set(null);
  }

  protected onOtpComplete(val: string): void {
    this.totpCode.set(val);
    this.handleSubmitTotp();
  }

  protected goToDashboard(): void {
    this.router.navigate(['/system-design']);
  }

  async handleSubmitTotp(): Promise<void> {
    if (this.totpCode().length < 6 || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.verify2Fa(this.totpCode());
      this.isSuccess.set(true);
      this.verifyCode.emit(this.totpCode());
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Invalid authentication code.'
      );
      this.otpInputRef()?.reset();
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleConfirmQr(): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.activate2Fa('123456');
      this.isSuccess.set(true);
      this.activate2fa.emit(this.manualSecretKey);
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Could not activate 2FA.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleSubmitBackup(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.backupCode() || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.verify2Fa(this.backupCode());
      this.isSuccess.set(true);
      this.verifyCode.emit(this.backupCode());
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Invalid recovery code.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
