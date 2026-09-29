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
import { AuthV2LayoutComponent } from '../auth-v2-layout';
import {
  FormFieldComponent,
  InputComponent,
  CheckboxComponent,
  ButtonComponent,
  AlertComponent,
  IconComponent,
  TranslatePipe,
} from '../../../shared';
import { AuthService } from '../../../core/services/auth.service';

/**
 * ChangePasswordV2Component — Centered card Change Password screen (Auth Version 2).
 */
@Component({
  selector: 'app-change-password-v2',
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
    IconComponent,
    TranslatePipe,
  ],
  template: `
    <app-auth-v2-layout
      [title]="'auth.changePassword' | translate"
      [subtitle]="'auth.changePasswordSub' | translate"
      icon="key"
    >
      @if (successMessage()) {
        <div class="rounded-2xl border border-success/30 bg-success/5 p-6 text-center space-y-4 mb-4">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <app-icon name="check-circle" size="lg" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-foreground">{{ 'auth.passwordUpdated' | translate }}</h3>
            <p class="text-xs text-muted mt-1">{{ successMessage() }}</p>
          </div>
          <div class="pt-2">
            <app-button
              variant="outline"
              size="md"
              [fullWidth]="true"
              (click)="resetForm()"
            >
              {{ 'auth.changeAnotherPassword' | translate }}
            </app-button>
          </div>
        </div>
      }

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
        <!-- Current Password -->
        <app-form-field [label]="'auth.currentPassword' | translate" [required]="true">
          <app-input
            [type]="showCurrentPassword() ? 'text' : 'password'"
            [placeholder]="'auth.passwordPlaceholder' | translate"
            [(ngModel)]="currentPassword"
            name="currentPassword"
            [required]="true"
            suffix="eye"
            (suffixClick)="showCurrentPassword.set(!showCurrentPassword())"
          />
        </app-form-field>

        <!-- New Password -->
        <app-form-field [label]="'auth.newPassword' | translate" [required]="true">
          <app-input
            [type]="showNewPassword() ? 'text' : 'password'"
            [placeholder]="'auth.passwordPlaceholder' | translate"
            [(ngModel)]="newPassword"
            name="newPassword"
            [required]="true"
            suffix="eye"
            (suffixClick)="showNewPassword.set(!showNewPassword())"
          />
        </app-form-field>

        <!-- Strength Meter -->
        @if (newPassword()) {
          <div class="space-y-1.5 pt-0.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted">{{ 'auth.passwordStrength' | translate }}</span>
              <span [class]="strengthLabelClass()">{{ strengthText() }}</span>
            </div>
            <div class="grid grid-cols-4 gap-1.5 h-1.5">
              <div class="rounded-full transition-all duration-300" [class]="meterBarClass(1)"></div>
              <div class="rounded-full transition-all duration-300" [class]="meterBarClass(2)"></div>
              <div class="rounded-full transition-all duration-300" [class]="meterBarClass(3)"></div>
              <div class="rounded-full transition-all duration-300" [class]="meterBarClass(4)"></div>
            </div>
          </div>
        }

        <!-- Confirm Password -->
        <app-form-field [label]="'auth.confirmPassword' | translate" [required]="true">
          <app-input
            [type]="showConfirmPassword() ? 'text' : 'password'"
            [placeholder]="'auth.passwordPlaceholder' | translate"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            [required]="true"
            suffix="eye"
            (suffixClick)="showConfirmPassword.set(!showConfirmPassword())"
          />
        </app-form-field>

        <!-- Logout other sessions checkbox -->
        <div class="pt-1">
          <app-checkbox
            [label]="'auth.logoutOtherDevices' | translate"
            [(checked)]="logoutOtherSessions"
          />
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <app-button
            type="submit"
            variant="primary"
            size="md"
            [fullWidth]="true"
            [loading]="isLoading()"
            [disabled]="!isValid()"
          >
            {{ 'auth.updatePassword' | translate }}
          </app-button>
        </div>
      </form>

      <div auth-footer class="space-y-2">
        <p>
          <a
            routerLink="/system-design"
            class="font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
          >
            &larr; Return to Dashboard
          </a>
        </p>
      </div>
    </app-auth-v2-layout>
  `,
})
export class ChangePasswordV2Component {
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

  protected readonly hasMinLength = computed(() => this.newPassword().length >= 8);
  protected readonly hasMatch = computed(() => {
    return this.newPassword().length > 0 && this.newPassword() === this.confirmPassword();
  });
  protected readonly isDifferent = computed(() => {
    return this.newPassword().length > 0 && this.newPassword() !== this.currentPassword();
  });
  protected readonly isValid = computed(() => {
    return this.currentPassword().length > 0 && this.hasMinLength() && this.hasMatch() && this.isDifferent();
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
    this.successMessage.set(null);

    try {
      await this.authService.changePassword({
        oldPassword: this.currentPassword(),
        newPassword: this.newPassword(),
        logoutOtherSessions: this.logoutOtherSessions(),
      });

      this.successMessage.set('Your password has been successfully updated.');
      this.passwordChanged.emit({
        oldPass: this.currentPassword(),
        newPass: this.newPassword(),
        logoutOtherSessions: this.logoutOtherSessions(),
      });
      this.resetForm();
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Current password incorrect.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected resetForm(): void {
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.errorMessage.set(null);
  }
}
