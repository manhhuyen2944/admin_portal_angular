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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { IconComponent } from '../../../shared/components/icon/icon';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

/**
 * ResetPasswordComponent — UI View Controller for setting a new password.
 * Business logic and API mutation delegated to AuthService.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AuthLayoutComponent,
    FormFieldComponent,
    InputComponent,
    ButtonComponent,
    AlertComponent,
    IconComponent,
    TranslatePipe,
  ],
  templateUrl: './reset-password.html',
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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

  // Validation rules
  protected readonly hasMinLength = computed(() => this.newPassword().length >= 8);
  protected readonly hasMixedChars = computed(() => {
    const val = this.newPassword();
    return /[a-zA-Z]/.test(val) && /[0-9]/.test(val);
  });
  protected readonly hasMatch = computed(() => {
    return this.newPassword().length > 0 && this.newPassword() === this.confirmPassword();
  });
  protected readonly isValid = computed(() => this.hasMinLength() && this.hasMatch());

  // Password strength calculation: 1 (weak) to 4 (very strong)
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
