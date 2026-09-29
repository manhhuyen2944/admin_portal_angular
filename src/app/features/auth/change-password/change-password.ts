import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field';
import { InputComponent } from '../../../shared/components/input/input';
import { CheckboxComponent } from '../../../shared/components/checkbox/checkbox';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { IconComponent } from '../../../shared/components/icon/icon';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

/**
 * ChangePasswordComponent — UI View Controller for authenticated password updates.
 * Logic and password policy mutation delegated to AuthService.
 */
@Component({
  selector: 'app-change-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AuthLayoutComponent,
    FormFieldComponent,
    InputComponent,
    CheckboxComponent,
    ButtonComponent,
    AlertComponent,
    IconComponent,
    TranslatePipe,
  ],
  templateUrl: './change-password.html',
})
export class ChangePasswordComponent {
  private readonly authService = inject(AuthService);

  protected currentPassword = signal('');
  protected newPassword = signal('');
  protected confirmPassword = signal('');
  protected logoutOtherSessions = signal(true);
  protected showCurrentPassword = signal(false);
  protected showNewPassword = signal(false);
  protected showConfirmPassword = signal(false);
  protected isLoading = signal(false);
  protected successMessage = signal<string | null>(null);
  protected errorMessage = signal<string | null>(null);

  passwordChanged = output<{ oldPass: string; newPass: string; logoutOtherSessions: boolean }>();

  protected readonly passwordsMatch = computed(() => {
    return this.newPassword().length > 0 && this.newPassword() === this.confirmPassword();
  });

  protected readonly isValid = computed(() => {
    return this.currentPassword().length > 0 && this.newPassword().length >= 8 && this.passwordsMatch();
  });

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
      await this.authService.changePassword({
        oldPassword: this.currentPassword(),
        newPassword: this.newPassword(),
        logoutOtherSessions: this.logoutOtherSessions(),
      });

      this.successMessage.set('Your password has been changed successfully.');
      this.passwordChanged.emit({
        oldPass: this.currentPassword(),
        newPass: this.newPassword(),
        logoutOtherSessions: this.logoutOtherSessions(),
      });
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected resetForm(): void {
    this.successMessage.set(null);
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
  }
}
