import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

export interface FooterLink {
  label: string;
  href: string;
}

/**
 * FooterComponent — global site-wide footer.
 * Shared across the entire application (AdminLayout, SystemDesign, etc.).
 *
 * Usage:
 *   <app-footer />
 *   <app-footer companyName="My Company" version="v2.0" status="Operational" />
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  host: {
    class: 'block shrink-0 w-full mt-auto',
  },
  templateUrl: './footer.html',
})
export class FooterComponent {
  private readonly translation = inject(TranslationService);

  companyName = input('Admin Portal');
  version = input('v1.0.0');
  status = input<string | undefined>(undefined);
  showLinks = input(true);
  links = input<FooterLink[] | null>(null);

  protected readonly year = new Date().getFullYear();

  protected readonly displayStatus = computed(() => {
    return this.status() ?? this.translation.t('footer.systemReady');
  });

  protected readonly defaultLinks = computed<FooterLink[]>(() => [
    { label: this.translation.t('footer.documentation'), href: '#' },
    { label: this.translation.t('footer.privacyPolicy'), href: '#' },
    { label: this.translation.t('footer.termsOfService'), href: '#' },
    { label: this.translation.t('footer.systemStatus'), href: '#' },
    { label: this.translation.t('footer.support'), href: '#' },
  ]);
}

