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
import { CheckboxComponent } from '../../../shared/components/checkbox/checkbox';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AuthService, type CurrentUser } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';

/**
 * LoginComponent — UI View Controller for authentication.
 * Delegates authentication logic and session state to AuthService.
 */
@Component({
  selector: 'app-login',
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
    TranslatePipe,
  ],
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly translation = inject(TranslationService);
  private readonly router = inject(Router);

  // View state signals
  protected email = signal('');
  protected password = signal('');
  protected rememberMe = signal(false);
  protected isLoading = signal(false);
  protected showPassword = signal(false);
  protected errorMessage = signal<string | null>(null);

  loginSubmit = output<CurrentUser>();

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.email() || !this.password()) {
      this.errorMessage.set(this.translation.t('auth.credentialsError'));
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const user = await this.authService.login({
        email: this.email(),
        password: this.password(),
        rememberMe: this.rememberMe(),
      });
      this.loginSubmit.emit(user);
      this.router.navigate(['/system-design']);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Login failed. Please check credentials.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.isLoading.set(true);
    try {
      const user = await this.authService.loginWithOAuth('google');
      this.loginSubmit.emit(user);
      this.router.navigate(['/system-design']);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginWithGithub(): Promise<void> {
    this.isLoading.set(true);
    try {
      const user = await this.authService.loginWithOAuth('github');
      this.loginSubmit.emit(user);
      this.router.navigate(['/system-design']);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'GitHub sign-in failed.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
