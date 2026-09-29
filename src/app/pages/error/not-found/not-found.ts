import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ThemeSelectorComponent } from '../../../shared/components/theme-selector/theme-selector';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/**
 * NotFoundComponent — High-fidelity 404 Page Not Found error view.
 *
 * Can be used as:
 * 1. Full-page standalone route (`/404` or `path: '**'`)
 * 2. Embedded error feedback component within any container
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    ButtonComponent,
    ThemeSelectorComponent,
    LanguageSelectorComponent,
    TranslatePipe,
  ],
  templateUrl: './not-found.html',
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  /** Custom override title (defaults to i18n key) */
  title = input<string | undefined>(undefined);

  /** Custom override description */
  description = input<string | undefined>(undefined);

  /** Show standalone header controls (Theme/Language switcher) */
  showControls = input(true);

  /** Show previous page go-back button */
  showBack = input(true);

  /** Custom home redirect path */
  homeHref = input('/system-design');

  /** Custom home button label override */
  homeLabel = input<string | undefined>(undefined);

  /** Custom back button label override */
  backLabel = input<string | undefined>(undefined);

  /** Embedded mode (inside card or modal instead of full page) */
  embedded = input(false);

  homeClick = output<void>();
  backClick = output<void>();

  protected isSearching = signal(false);

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
}
