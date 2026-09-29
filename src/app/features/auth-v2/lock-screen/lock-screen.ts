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
import {
  AvatarComponent,
  FormFieldComponent,
  InputComponent,
  ButtonComponent,
  AlertComponent,
  IconComponent,
  LanguageSelectorComponent,
  ThemeSelectorComponent,
  TranslatePipe,
} from '../../../shared';
import { AuthService } from '../../../core/services/auth.service';

/**
 * LockScreenV2Component — Centered card Lock Screen (Auth Version 2).
 */
@Component({
  selector: 'app-lock-screen-v2',
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
    LanguageSelectorComponent,
    ThemeSelectorComponent,
    TranslatePipe,
  ],
  template: `
    <div class="min-h-screen w-full flex flex-col justify-between bg-background text-foreground relative overflow-hidden select-none">
      <!-- Ambient Glows (No images) -->
      <div class="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/15 dark:bg-primary/25 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl"></div>

      <!-- Top Utility Header -->
      <header class="w-full flex items-center justify-between px-4 sm:px-8 py-5 z-20">
        <a routerLink="/auth-v2/login" class="flex items-center gap-2.5 cursor-pointer">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/25">
            <app-icon name="shield" size="sm" />
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold tracking-tight text-foreground">Admin Portal</span>
            <span class="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold">V2</span>
          </div>
        </a>

        <div class="flex items-center gap-2">
          <app-language-selector />
          <app-theme-selector />
        </div>
      </header>

      <!-- Center Card -->
      <main class="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 z-10 w-full">
        <div class="w-full max-w-sm rounded-3xl border border-border bg-surface/95 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          <!-- User Profile Display -->
          <div class="flex flex-col items-center text-center">
            <div class="relative">
              <app-avatar [name]="userName()" size="lg" class="shadow-lg ring-4 ring-surface" />
              <div class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-warning border-2 border-surface" title="Session Locked"></div>
            </div>
            <h3 class="text-base font-bold text-foreground mt-3.5 tracking-tight">{{ userName() }}</h3>
            <p class="text-xs text-muted mt-0.5">{{ userEmail() }}</p>
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

          <!-- Unlock Form -->
          <form (submit)="handleUnlock($event)" class="space-y-4" novalidate>
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

            <div class="pt-2">
              <app-button
                type="submit"
                variant="primary"
                size="md"
                [fullWidth]="true"
                [loading]="isLoading()"
                [disabled]="!password()"
              >
                {{ 'auth.unlock' | translate }}
              </app-button>
            </div>
          </form>

          <div class="text-center pt-2">
            <a
              routerLink="/auth-v2/login"
              class="text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
            >
              Sign in as different user
            </a>
          </div>
        </div>
      </main>

      <footer class="w-full text-center py-4 text-xs text-muted z-10">
        <p>&copy; 2026 Admin Portal &bull; Enterprise Security Architecture</p>
      </footer>
    </div>
  `,
})
export class LockScreenV2Component {
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
    if (!this.password() || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.unlockSession(this.password());
      this.unlock.emit(this.password());
      await this.router.navigate(['/system-design']);
    } catch {
      this.errorMessage.set('Incorrect password. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
