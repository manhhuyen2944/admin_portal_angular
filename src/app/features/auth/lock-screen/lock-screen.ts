import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../shared/components/avatar/avatar';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { IconComponent } from '../../../shared/components/icon/icon';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

/**
 * LockScreenComponent — UI View Controller for unlocking user session.
 * Unlock authentication delegated to AuthService.
 */
@Component({
  selector: 'app-lock-screen',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AvatarComponent,
    FormFieldComponent,
    InputComponent,
    ButtonComponent,
    AlertComponent,
    IconComponent,
    TranslatePipe,
  ],
  templateUrl: './lock-screen.html',
})
export class LockScreenComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  userNameInput = input<string | undefined>(undefined, { alias: 'userName' });
  userEmailInput = input<string | undefined>(undefined, { alias: 'userEmail' });

  unlock = output<string>();

  protected readonly userName = computed(() => {
    return this.userNameInput() || this.authService.user()?.name || 'Alex Morgan';
  });

  protected readonly userEmail = computed(() => {
    return this.userEmailInput() || this.authService.user()?.email || 'alex.morgan@company.com';
  });

  protected password = signal('');
  protected showPassword = signal(false);
  protected isLoading = signal(false);
  protected errorMessage = signal<string | null>(null);

  async handleUnlock(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.password() || this.isLoading()) {
      this.errorMessage.set('Please enter your password to unlock.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.unlockSession(this.password());
      this.unlock.emit(this.password());
      this.router.navigate(['/']);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Incorrect password.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
