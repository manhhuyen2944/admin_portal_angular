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
  ButtonComponent,
  AlertComponent,
  TranslatePipe,
} from '../../../shared';
import { AuthService } from '../../../core/services/auth.service';

/**
 * ForgotPasswordV2Component — Centered card Forgot Password screen (Auth Version 2).
 */
@Component({
  selector: 'app-forgot-password-v2',
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
    TranslatePipe,
  ],
  template: `
    <app-auth-v2-layout
      [title]="'auth.forgotPasswordTitle' | translate"
      [subtitle]="'auth.forgotPasswordDesc' | translate"
      icon="mail"
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
        <app-form-field [label]="'auth.emailAddress' | translate" [required]="true">
          <app-input
            type="email"
            [placeholder]="'auth.emailPlaceholder' | translate"
            [(ngModel)]="email"
            name="email"
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
            [disabled]="!email()"
          >
            {{ 'auth.sendResetCode' | translate }}
          </app-button>
        </div>
      </form>

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
export class ForgotPasswordV2Component {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected email = signal('');
  protected isLoading = signal(false);
  protected errorMessage = signal<string | null>(null);

  resetRequest = output<string>();

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.email()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.requestPasswordReset(this.email());
      this.resetRequest.emit(this.email());
      await this.router.navigate(['/auth-v2/verify-email'], {
        queryParams: { email: this.email() },
      });
    } catch {
      this.errorMessage.set('Failed to send reset link. Please check your email and try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
