import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthV2LayoutComponent } from '../auth-v2-layout';
import {
  OtpInputComponent,
  QrCodeComponent,
  FormFieldComponent,
  InputComponent,
  ButtonComponent,
  AlertComponent,
  IconComponent,
  TranslatePipe,
} from '../../../shared';
import { AuthService } from '../../../core/services/auth.service';

export type TwoFactorTab = 'code' | 'qr';

/**
 * TwoFactorV2Component — Centered card Two Factor Authentication screen (Auth Version 2).
 */
@Component({
  selector: 'app-two-factor-v2',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AuthV2LayoutComponent,
    OtpInputComponent,
    QrCodeComponent,
    FormFieldComponent,
    InputComponent,
    ButtonComponent,
    AlertComponent,
    IconComponent,
    TranslatePipe,
  ],
  template: `
    <app-auth-v2-layout
      [title]="'auth.twoFactor' | translate"
      [subtitle]="'auth.twoFactorSub' | translate"
      icon="shield"
    >
      @if (isSuccess()) {
        <!-- Success state -->
        <div class="rounded-2xl border border-success/30 bg-success/5 p-6 text-center space-y-4 animate-in zoom-in-95 fade-in duration-300">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success shadow-lg shadow-success/10">
            <app-icon name="check-circle" size="lg" />
          </div>
          <div>
            <h3 class="text-base font-bold text-foreground">
              {{ activeTab() === 'qr' ? ('auth.twoFactor' | translate) + ' - ' + ('common.confirm' | translate) : ('auth.codeVerifiedSuccess' | translate) }}
            </h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              {{ activeTab() === 'qr'
                  ? ('auth.twoFactorSuccessQr' | translate)
                  : ('auth.twoFactorSuccessCode' | translate) }}
            </p>
          </div>
          <div class="pt-2">
            <app-button
              variant="primary"
              size="md"
              [fullWidth]="true"
              (click)="goToDashboard()"
            >
              {{ 'auth.continueToDashboard' | translate }}
            </app-button>
          </div>
        </div>
      } @else {
        <!-- Mode Switcher Tabs -->
        <div class="grid grid-cols-2 p-1 rounded-xl bg-surface-raised border border-border mb-4">
          <button
            type="button"
            class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
            [class.bg-surface]="activeTab() === 'code'"
            [class.text-foreground]="activeTab() === 'code'"
            [class.shadow-xs]="activeTab() === 'code'"
            [class.text-muted]="activeTab() !== 'code'"
            (click)="switchTab('code')"
          >
            <app-icon name="key" size="xs" />
            <span>{{ 'auth.enterCodeTab' | translate }}</span>
          </button>
          <button
            type="button"
            class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
            [class.bg-surface]="activeTab() === 'qr'"
            [class.text-foreground]="activeTab() === 'qr'"
            [class.shadow-xs]="activeTab() === 'qr'"
            [class.text-muted]="activeTab() !== 'qr'"
            (click)="switchTab('qr')"
          >
            <app-icon name="qr-code" size="xs" />
            <span>{{ 'auth.scanQrTab' | translate }}</span>
          </button>
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

        <!-- TAB 1: CODE VERIFICATION -->
        @if (activeTab() === 'code') {
          <div class="space-y-4">
            @if (!useRecoveryCode()) {
              <!-- Standard TOTP 6-digit flow -->
              <div class="space-y-4">
                <p class="text-xs text-muted text-center leading-relaxed">
                  {{ 'auth.enterCodeNotice' | translate }}
                </p>

                <div class="flex justify-center pt-1">
                  <app-otp-input
                    [length]="6"
                    [disabled]="isLoading() || isSuccess()"
                    (valueChange)="otpValue.set($event)"
                    (completed)="handleOtpComplete($event)"
                  />
                </div>

                <div class="pt-2">
                  <app-button
                    variant="primary"
                    size="md"
                    [fullWidth]="true"
                    [loading]="isLoading()"
                    [disabled]="otpValue().length < 6"
                    (clicked)="handleSubmitOtp()"
                  >
                    {{ 'auth.verifyAndSignIn' | translate }}
                  </app-button>
                </div>
              </div>
            } @else {
              <!-- Backup / Recovery code flow -->
              <form (submit)="handleSubmitRecovery($event)" class="space-y-4" novalidate>
                <app-form-field [label]="'auth.backupCode' | translate" [required]="true">
                  <app-input
                    type="text"
                    [placeholder]="'auth.backupCodePlaceholder' | translate"
                    [(ngModel)]="recoveryCode"
                    name="recoveryCode"
                    [required]="true"
                  />
                </app-form-field>

                <div class="pt-2">
                  <app-button
                    type="submit"
                    variant="primary"
                    size="md"
                    [fullWidth]="true"
                    [loading]="isLoading()"
                    [disabled]="!recoveryCode()"
                  >
                    {{ 'auth.verifyRecoveryCode' | translate }}
                  </app-button>
                </div>
              </form>
            }

            <!-- Switch to recovery code toggle -->
            <div class="text-center pt-1">
              <button
                type="button"
                (click)="useRecoveryCode.set(!useRecoveryCode())"
                class="text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                {{ useRecoveryCode() ? ('auth.useTotpCode' | translate) : ('auth.useBackupCode' | translate) }}
              </button>
            </div>
          </div>
        }

        <!-- TAB 2: QR CODE PAIRING -->
        @if (activeTab() === 'qr') {
          <div class="space-y-4">
            <div class="flex justify-center p-3 rounded-2xl bg-surface-raised/40 border border-border">
              <app-qr-code
                [value]="totpSecretUri"
                [size]="160"
                [showManualKey]="true"
                manualKey="JBSWY3DPEHPK3PXP"
                [label]="'auth.scanWithApp' | translate"
              />
            </div>

            <!-- Confirm OTP after scanning -->
            <div class="space-y-3 pt-1">
              <p class="text-xs text-muted text-center">
                {{ 'auth.enterConfirmCode' | translate }}
              </p>
              <div class="flex justify-center">
                <app-otp-input
                  [length]="6"
                  [disabled]="isLoading() || isSuccess()"
                  (valueChange)="qrOtpValue.set($event)"
                />
              </div>

              <div class="pt-1">
                <app-button
                  variant="primary"
                  size="md"
                  [fullWidth]="true"
                  [loading]="isLoading()"
                  [disabled]="qrOtpValue().length < 6"
                  (clicked)="handleConfirmQr()"
                >
                  {{ 'auth.enable2fa' | translate }}
                </app-button>
              </div>
            </div>
          </div>
        }
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
export class TwoFactorV2Component {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  verifyCode = output<string>();
  activate2fa = output<string>();

  protected activeTab = signal<TwoFactorTab>('code');
  protected otpValue = signal('');
  protected qrOtpValue = signal('');
  protected recoveryCode = signal('');
  protected useRecoveryCode = signal(false);
  protected isLoading = signal(false);
  protected isSuccess = signal(false);
  protected errorMessage = signal<string | null>(null);

  protected readonly totpSecretUri =
    'otpauth://totp/AdminPortal:admin@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AdminPortal';

  switchTab(tab: TwoFactorTab): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
  }

  handleOtpComplete(code: string): void {
    this.otpValue.set(code);
    this.handleSubmitOtp();
  }

  async handleSubmitOtp(): Promise<void> {
    const code = this.otpValue();
    if (code.length < 6 || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.verify2Fa(code);
      this.isSuccess.set(true);
      this.verifyCode.emit(code);
      setTimeout(() => this.goToDashboard(), 1500);
    } catch {
      this.errorMessage.set('Invalid authentication code. Please try again.');
      this.otpValue.set('');
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleSubmitRecovery(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.recoveryCode() || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.verify2Fa(this.recoveryCode());
      this.isSuccess.set(true);
      this.verifyCode.emit(this.recoveryCode());
      setTimeout(() => this.goToDashboard(), 1500);
    } catch {
      this.errorMessage.set('Invalid recovery code. Please check and try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleConfirmQr(): Promise<void> {
    const code = this.qrOtpValue();
    if (code.length < 6 || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.activate2Fa(code);
      this.isSuccess.set(true);
      this.activate2fa.emit(code);
      setTimeout(() => this.goToDashboard(), 1500);
    } catch {
      this.errorMessage.set('Confirmation code invalid. Please try scanning again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async goToDashboard(): Promise<void> {
    await this.router.navigate(['/system-design']);
  }
}
