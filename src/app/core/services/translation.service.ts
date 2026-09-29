import { computed, Injectable, signal } from '@angular/core';
import enJson from '../../../assets/i18n/en.json';
import viJson from '../../../assets/i18n/vi.json';

export type SupportedLanguage = 'en' | 'vi';

export interface LanguageInfo {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

/**
 * Recursively flattens nested JSON translation objects into dot-notated key-value pairs.
 * Example: { auth: { signIn: "Sign In" } } => { "auth.signIn": "Sign In" }
 */
function flattenTranslations(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'string') {
      flattened[path] = val;
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(flattened, flattenTranslations(val, path));
    }
  }
  return flattened;
}

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: flattenTranslations(enJson),
  vi: flattenTranslations(viJson),
};


/**
 * TranslationService — Central reactive internationalization (i18n) service.
 * Supports reactive language switching between English (en) and Vietnamese (vi).
 * Persists selected language to localStorage.
 */
@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly STORAGE_KEY = 'app-language';

  private readonly _currentLang = signal<SupportedLanguage>(this.getInitialLanguage());

  readonly currentLang = this._currentLang.asReadonly();
  readonly supportedLanguages = SUPPORTED_LANGUAGES;

  readonly isVietnamese = computed(() => this._currentLang() === 'vi');
  readonly isEnglish = computed(() => this._currentLang() === 'en');

  constructor() {
    this.applyDocumentLang(this._currentLang());
  }

  /**
   * Set active language ('en' | 'vi'). Updates signal, localStorage and html[lang].
   */
  setLanguage(lang: SupportedLanguage): void {
    if (lang === this._currentLang()) return;
    this._currentLang.set(lang);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, lang);
      } catch {}
    }
    this.applyDocumentLang(lang);
  }

  /**
   * Toggle between English and Vietnamese
   */
  toggleLanguage(): void {
    this.setLanguage(this._currentLang() === 'en' ? 'vi' : 'en');
  }

  /**
   * Translate a key into the active language with optional parameter interpolation.
   * Usage:
   *   service.t('auth.signIn')
   *   service.t('common.unreadNotifications', { count: 3 })
   */
  t(key: string, params?: Record<string, string | number>): string {
    const lang = this._currentLang();
    let text = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en']?.[key] ?? key;

    if (params) {
      for (const [paramKey, paramVal] of Object.entries(params)) {
        text = text.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(paramVal));
      }
    }
    return text;
  }

  /**
   * Alias for t()
   */
  translate(key: string, params?: Record<string, string | number>): string {
    return this.t(key, params);
  }

  private getInitialLanguage(): SupportedLanguage {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY) as SupportedLanguage | null;
        if (saved && (saved === 'en' || saved === 'vi')) {
          return saved;
        }
      } catch {}
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      if (navigator.language.toLowerCase().startsWith('vi')) {
        return 'vi';
      }
    }
    return 'en';
  }

  private applyDocumentLang(lang: SupportedLanguage): void {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = lang;
    }
  }
}
