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
  FormFieldComponent,
  InputComponent,
  CheckboxComponent,
  ButtonComponent,
  AlertComponent,
  TranslatePipe,
} from '../../../shared';
import { AuthService, type CurrentUser } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';

/**
 * LoginV2Component — Centered card Login screen (Auth Version 2).
 */
@Component({
  selector: 'app-login-v2',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AuthV2LayoutComponent,
    FormFieldComponent,
    InputComponent,
    CheckboxComponent,
    ButtonComponent,
    AlertComponent,
    TranslatePipe,
  ],
  template: `
    <app-auth-v2-layout
      [title]="'auth.signIn' | translate"
      [subtitle]="'auth.signInToAccount' | translate"
      icon="lock"
    >
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
        <!-- Email -->
        <app-form-field [label]="'auth.emailAddress' | translate" [required]="true">
          <app-input
            type="email"
            [placeholder]="'auth.emailPlaceholder' | translate"
            [(ngModel)]="email"
            name="email"
            [required]="true"
          />
        </app-form-field>

        <!-- Password -->
        <app-form-field [label]="'auth.password' | translate" [required]="true">
          <app-input
            [type]="showPassword() ? 'text' : 'password'"
            [placeholder]="'auth.passwordPlaceholder' | translate"
            [(ngModel)]="password"
            name="password"
            [required]="true"
            suffix="eye"
            (suffixClick)="showPassword.set(!showPassword())"
          />
        </app-form-field>

        <!-- Remember me & Forgot Password -->
        <div class="flex items-center justify-between text-xs pt-1">
          <app-checkbox [label]="'auth.rememberMe' | translate" [(checked)]="rememberMe" />
          <a
            routerLink="/auth-v2/forgot-password"
            class="font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
          >
            {{ 'auth.forgotPassword' | translate }}
          </a>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <app-button
            type="submit"
            variant="primary"
            size="md"
            [fullWidth]="true"
            [loading]="isLoading()"
            [disabled]="!email() || !password()"
          >
            {{ 'auth.signIn' | translate }}
          </app-button>
        </div>
      </form>

      <!-- Social Dividers -->
      <div class="relative my-4">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border"></div>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-surface px-2 text-muted font-medium">Or continue with</span>
        </div>
      </div>

      <!-- Social Buttons -->
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-surface-raised hover:border-border-hover active:scale-[0.98] cursor-pointer"
          (click)="loginWithGoogle()"
        >
          <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-surface-raised hover:border-border-hover active:scale-[0.98] cursor-pointer"
          (click)="loginWithGithub()"
        >
          <svg class="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          GitHub
        </button>
      </div>

      <!-- Auth Footer Link -->
      <div auth-footer class="space-y-2">
        <p>
          Don't have an account?
          <a
            routerLink="/auth-v2/register"
            class="font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer ml-1"
          >
            Contact Admin
          </a>
        </p>
        <p class="text-[11px] text-muted">
          Need standard split-screen?
          <a
            routerLink="/auth/login"
            class="underline hover:text-foreground transition-colors cursor-pointer ml-1"
          >
            Switch to Auth V1
          </a>
        </p>
      </div>
    </app-auth-v2-layout>
  `,
})
export class LoginV2Component {
  private readonly authService = inject(AuthService);
  private readonly translation = inject(TranslationService);
  private readonly router = inject(Router);

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
      this.errorMessage.set(this.translation.translate('auth.invalidCredentials'));
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
      await this.router.navigate(['/system-design']);
    } catch {
      this.errorMessage.set(this.translation.translate('auth.invalidCredentials'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.isLoading.set(true);
    try {
      const user = await this.authService.loginWithOAuth('google');
      this.loginSubmit.emit(user);
      await this.router.navigate(['/system-design']);
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
      await this.router.navigate(['/system-design']);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'GitHub sign-in failed.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
