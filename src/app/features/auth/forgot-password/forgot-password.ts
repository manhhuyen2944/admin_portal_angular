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
import { AuthLayoutComponent } from '../auth-layout';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

/**
 * ForgotPasswordComponent — View Controller for initiating password resets.
 * Delegates requestPasswordReset business logic to AuthService.
 */
@Component({
  selector: 'app-forgot-password',
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
    TranslatePipe,
  ],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected email = signal('');
  protected isLoading = signal(false);
  protected errorMessage = signal<string | null>(null);

  resetRequest = output<string>();

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.email()) {
      this.errorMessage.set('Please provide your email address.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.requestPasswordReset(this.email());
      this.resetRequest.emit(this.email());

      // Navigate to /auth/verify-otp so URL changes in browser
      this.router.navigate(['/auth/verify-otp'], {
        queryParams: {
          email: this.email(),
          type: 'reset-password',
        },
      });
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to send reset code.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
