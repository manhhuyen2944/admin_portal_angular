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
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AvatarComponent } from '../../../shared/components/avatar/avatar';
import { ThemeSelectorComponent } from '../../../shared/components/theme-selector/theme-selector';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

/**
 * AccessDeniedComponent — High-fidelity 403 Forbidden / Access Denied error view.
 *
 * Can be used as:
 * 1. Full-page standalone route (`/403` or `/access-denied`)
 * 2. Embedded component when route or permission check fails
 */
@Component({
  selector: 'app-access-denied, app-no-permission',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    ButtonComponent,
    AvatarComponent,
    ThemeSelectorComponent,
    LanguageSelectorComponent,
    TranslatePipe,
  ],
  templateUrl: './access-denied.html',
})
export class AccessDeniedComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  /** Custom title override */
  title = input<string | undefined>(undefined);

  /** Custom description override */
  description = input<string | undefined>(undefined);

  /** Required role for access */
  requiredRole = input<string | undefined>(undefined);

  /** Required permission string */
  requiredPermission = input<string | undefined>(undefined);

  /** Show standalone header controls */
  showControls = input(true);

  /** Show previous page go-back button */
  showBack = input(true);

  /** Show request access button */
  showRequestAccess = input(true);

  /** Custom home button label override */
  homeLabel = input<string | undefined>(undefined);

  /** Custom back button label override */
  backLabel = input<string | undefined>(undefined);

  /** Show home button */
  showHome = input(true);

  /** Embedded mode (inside card or modal instead of full page) */
  embedded = input(false);

  /** Custom home redirect path */
  homeHref = input('/system-design');

  homeClick = output<void>();
  backClick = output<void>();
  requestAccess = output<void>();

  protected readonly currentUser = computed(() => this.authService.user());
  protected readonly requestSubmitted = signal(false);
  protected readonly isRequesting = signal(false);

  protected handleGoBack(): void {
    this.backClick.emit();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate([this.homeHref()]);
    }
  }

  protected handleGoHome(): void {
    this.homeClick.emit();
    this.router.navigate([this.homeHref()]);
  }

  protected handleRequestAccess(): void {
    this.isRequesting.set(true);
    setTimeout(() => {
      this.isRequesting.set(false);
      this.requestSubmitted.set(true);
      this.requestAccess.emit();
    }, 600);
  }
}
