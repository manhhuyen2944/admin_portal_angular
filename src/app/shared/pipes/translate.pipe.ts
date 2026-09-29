import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

/**
 * TranslatePipe — Translates localization keys dynamically into active language.
 *
 * Usage:
 *   <h1>{{ 'auth.signIn' | translate }}</h1>
 *   <p>{{ 'common.unreadNotifications' | translate:{ count: 5 } }}</p>
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translation = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    if (!key) return '';
    return this.translation.t(key, params);
  }
}
