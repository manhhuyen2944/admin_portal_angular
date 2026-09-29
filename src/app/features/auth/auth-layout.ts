import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon';
import type { IconName } from '../../shared/components/icon/icon-registry';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector';
import { ThemeSelectorComponent } from '../../shared/components/theme-selector/theme-selector';

/**
 * AuthLayoutComponent — premium split-screen auth layout.
 *
 * Layout:
 *   Left 50%: Hero image, branding, trust badges (hidden mobile)
 *   Right 50%: Form slot, back navigation, footer slot (full-width mobile)
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, LanguageSelectorComponent, ThemeSelectorComponent],
  templateUrl: './auth-layout.html',
})
export class AuthLayoutComponent {
  // Page-specific
  title      = input.required<string>();
  subtitle   = input<string | undefined>(undefined);
  /** Leading icon displayed above title (use app-icon name) */
  icon       = input<IconName | undefined>(undefined);
  /** Back navigation link */
  backLabel  = input<string | undefined>(undefined);
  backHref   = input('/auth/login');

  // Hero panel (left)
  heroImage    = input<string | undefined>(undefined);
  heroTitle    = input('Secure Admin Portal');
  heroSubtitle = input('Manage your organization with confidence. Enterprise-grade security built for modern teams.');
  statusLabel  = input('All systems operational');

  // Branding
  brandName = input('AdminPortal');

  // Feature bullets (shown in bottom left of hero)
  features = input<{ icon: IconName; label: string; desc: string }[]>([
    { icon: 'shield',       label: 'Enterprise Security', desc: 'SOC 2 Type II certified' },
    { icon: 'star',         label: 'Fast & Reliable',     desc: '99.99% uptime SLA'       },
    { icon: 'users',        label: 'Team Management',     desc: 'Granular role control'    },
    { icon: 'trending-up',  label: 'Analytics',          desc: 'Real-time dashboards'     },
  ]);

  protected readonly currentYear = new Date().getFullYear();

  // Fallback gradient if no hero image provided
  protected readonly defaultHeroGradient =
    'linear-gradient(135deg, oklch(0.3 0.12 270) 0%, oklch(0.18 0.08 240) 50%, oklch(0.12 0.05 220) 100%)';
}
