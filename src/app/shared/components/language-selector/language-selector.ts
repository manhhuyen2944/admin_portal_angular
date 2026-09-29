import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { DropdownComponent, DropdownItem } from '../dropdown/dropdown';
import { TranslationService, type SupportedLanguage } from '../../../core/services/translation.service';

export type LanguageVariant = 'toggle' | 'segmented' | 'dropdown';

export interface LanguageOption {
  code: string;
  label: string;
  flag?: string;
}

const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

/**
 * LanguageSelector — language / locale switcher component with national flag icons.
 * Supports toggle (flag icon button, matching theme-selector), segmented, or dropdown modes.
 *
 * Usage:
 *   <!-- Flag icon toggle button (quick 1-click switch like dark mode) -->
 *   <app-language-selector />
 *
 *   <!-- Segmented buttons -->
 *   <app-language-selector variant="segmented" />
 *
 *   <!-- Dropdown selector -->
 *   <app-language-selector variant="dropdown" />
 */
@Component({
  selector: 'app-language-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, DropdownComponent],
  template: `
    @if (variant() === 'toggle') {
      <button
        type="button"
        class="relative flex h-8 w-8 items-center justify-center rounded-lg text-foreground hover:bg-surface-raised transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer group"
        [attr.aria-label]="'Current language: ' + activeLang().label + '. Click to switch language'"
        [title]="'Language: ' + activeLang().label + ' (' + activeLang().code.toUpperCase() + ') — Click to switch'"
        (click)="cycleLanguage()"
      >
        <!-- National Flag Icon (Lá cờ Việt Nam / Mỹ) -->
        @if (activeLang().code === 'vi') {
          <svg class="h-4.5 w-6 rounded shadow-xs border border-border/40 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 30 20">
            <rect width="30" height="20" fill="#da251d"/>
            <polygon points="15,4 16.5,8.8 21.6,8.8 17.5,11.8 19,16.5 15,13.5 11,16.5 12.5,11.8 8.4,8.8 13.5,8.8" fill="#ffff00"/>
          </svg>
        } @else {
          <svg class="h-4.5 w-6 rounded shadow-xs border border-border/40 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 30 20">
            <rect width="30" height="20" fill="#b22234"/>
            <rect y="1.54" width="30" height="1.54" fill="#ffffff"/>
            <rect y="4.62" width="30" height="1.54" fill="#ffffff"/>
            <rect y="7.69" width="30" height="1.54" fill="#ffffff"/>
            <rect y="10.77" width="30" height="1.54" fill="#ffffff"/>
            <rect y="13.85" width="30" height="1.54" fill="#ffffff"/>
            <rect y="16.92" width="30" height="1.54" fill="#ffffff"/>
            <rect width="12" height="10.77" fill="#3c3b6e"/>
            <circle cx="2.5" cy="2.5" r="0.7" fill="#ffffff"/>
            <circle cx="6" cy="2.5" r="0.7" fill="#ffffff"/>
            <circle cx="9.5" cy="2.5" r="0.7" fill="#ffffff"/>
            <circle cx="4.25" cy="5.4" r="0.7" fill="#ffffff"/>
            <circle cx="7.75" cy="5.4" r="0.7" fill="#ffffff"/>
            <circle cx="2.5" cy="8.2" r="0.7" fill="#ffffff"/>
            <circle cx="6" cy="8.2" r="0.7" fill="#ffffff"/>
            <circle cx="9.5" cy="8.2" r="0.7" fill="#ffffff"/>
          </svg>
        }
        <span class="absolute -bottom-1 -right-1 text-[8px] font-extrabold uppercase tracking-tight bg-surface-raised border border-border text-foreground px-1 py-0.2 rounded-full leading-none shadow-xs font-mono select-none">
          {{ activeLang().code }}
        </span>
      </button>
    } @else if (variant() === 'segmented') {
      <div class="inline-flex items-center rounded-xl p-1 bg-surface-raised border border-border">
        @for (l of languages(); track l.code) {
          <button
            type="button"
            class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            [class]="activeLang().code === l.code ? 'bg-surface text-primary shadow-xs font-semibold' : 'text-muted hover:text-foreground'"
            (click)="selectLanguage(l.code)"
          >
            @if (l.code === 'vi') {
              <svg class="h-3.5 w-4.5 rounded-xs shrink-0" viewBox="0 0 30 20">
                <rect width="30" height="20" fill="#da251d"/>
                <polygon points="15,4 16.5,8.8 21.6,8.8 17.5,11.8 19,16.5 15,13.5 11,16.5 12.5,11.8 8.4,8.8 13.5,8.8" fill="#ffff00"/>
              </svg>
            } @else if (l.code === 'en') {
              <svg class="h-3.5 w-4.5 rounded-xs shrink-0" viewBox="0 0 30 20">
                <rect width="30" height="20" fill="#b22234"/>
                <rect y="1.54" width="30" height="1.54" fill="#ffffff"/>
                <rect y="4.62" width="30" height="1.54" fill="#ffffff"/>
                <rect y="7.69" width="30" height="1.54" fill="#ffffff"/>
                <rect y="10.77" width="30" height="1.54" fill="#ffffff"/>
                <rect y="13.85" width="30" height="1.54" fill="#ffffff"/>
                <rect y="16.92" width="30" height="1.54" fill="#ffffff"/>
                <rect width="12" height="10.77" fill="#3c3b6e"/>
              </svg>
            }
            <span>{{ l.label }}</span>
          </button>
        }
      </div>
    } @else {
      <!-- Dropdown mode -->
      <app-dropdown [items]="dropdownItems()" align="right" (itemClick)="handleSelect($event)">
        <ng-container trigger>
          <button
            type="button"
            class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border border-border bg-surface hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
            [attr.aria-label]="'Selected language: ' + activeLang().label"
          >
            @if (activeLang().code === 'vi') {
              <svg class="h-3.5 w-4.5 rounded-xs shrink-0" viewBox="0 0 30 20">
                <rect width="30" height="20" fill="#da251d"/>
                <polygon points="15,4 16.5,8.8 21.6,8.8 17.5,11.8 19,16.5 15,13.5 11,16.5 12.5,11.8 8.4,8.8 13.5,8.8" fill="#ffff00"/>
              </svg>
            } @else if (activeLang().code === 'en') {
              <svg class="h-3.5 w-4.5 rounded-xs shrink-0" viewBox="0 0 30 20">
                <rect width="30" height="20" fill="#b22234"/>
                <rect y="1.54" width="30" height="1.54" fill="#ffffff"/>
                <rect y="4.62" width="30" height="1.54" fill="#ffffff"/>
                <rect y="7.69" width="30" height="1.54" fill="#ffffff"/>
                <rect y="10.77" width="30" height="1.54" fill="#ffffff"/>
                <rect y="13.85" width="30" height="1.54" fill="#ffffff"/>
                <rect y="16.92" width="30" height="1.54" fill="#ffffff"/>
                <rect width="12" height="10.77" fill="#3c3b6e"/>
              </svg>
            }
            <span class="text-foreground uppercase tracking-wider font-semibold">{{ activeLang().code }}</span>
            <app-icon name="chevron-down" size="xs" class="text-muted -mr-0.5" />
          </button>
        </ng-container>
      </app-dropdown>
    }
  `,
})
export class LanguageSelectorComponent {
  private readonly translationService = inject(TranslationService);

  variant = input<LanguageVariant>('toggle');
  languages = input<LanguageOption[]>(DEFAULT_LANGUAGES);
  currentLanguage = model<string | null>(null);

  languageChange = output<LanguageOption>();

  protected readonly activeLang = computed(() => {
    const code = this.currentLanguage() ?? this.translationService.currentLang();
    return this.languages().find(l => l.code === code) ?? this.languages()[0];
  });

  protected readonly dropdownItems = computed<DropdownItem[]>(() => {
    return this.languages().map(l => ({
      id: l.code,
      label: `${l.flag ? l.flag + ' ' : ''}${l.label}`,
    }));
  });

  cycleLanguage(): void {
    const list = this.languages();
    const currentCode = this.activeLang().code;
    const currentIndex = list.findIndex(l => l.code === currentCode);
    const nextIndex = (currentIndex + 1) % list.length;
    const nextLang = list[nextIndex];
    if (nextLang) {
      this.selectLanguage(nextLang.code);
    }
  }

  selectLanguage(langCode: string): void {
    const supported = langCode as SupportedLanguage;
    this.currentLanguage.set(supported);
    this.translationService.setLanguage(supported);

    const selected = this.languages().find(l => l.code === langCode);
    if (selected) {
      this.languageChange.emit(selected);
    }
  }

  protected handleSelect(item: DropdownItem): void {
    this.selectLanguage(item.id);
  }
}
