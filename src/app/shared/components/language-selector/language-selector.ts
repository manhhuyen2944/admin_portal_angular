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
 * LanguageSelector — language / locale switcher dropdown.
 * Integrates with TranslationService to switch between English & Vietnamese.
 *
 * Usage:
 *   <app-language-selector />
 */
@Component({
  selector: 'app-language-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, DropdownComponent],
  template: `
    <app-dropdown [items]="dropdownItems()" align="right" (itemClick)="handleSelect($event)">
      <ng-container trigger>
        <button
          type="button"
          class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border border-border bg-surface hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
          [attr.aria-label]="'Selected language: ' + activeLang().label"
        >
          @if (activeLang().flag) {
            <span class="text-sm leading-none">{{ activeLang().flag }}</span>
          } @else {
            <app-icon name="globe" size="xs" class="text-muted" />
          }
          <span class="text-foreground uppercase tracking-wider font-semibold">{{ activeLang().code }}</span>
          <app-icon name="chevron-down" size="xs" class="text-muted -mr-0.5" />
        </button>
      </ng-container>
    </app-dropdown>
  `,
})
export class LanguageSelectorComponent {
  private readonly translationService = inject(TranslationService);

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

  protected handleSelect(item: DropdownItem): void {
    const langCode = item.id as SupportedLanguage;
    this.currentLanguage.set(langCode);
    this.translationService.setLanguage(langCode);

    const selected = this.languages().find(l => l.code === item.id);
    if (selected) {
      this.languageChange.emit(selected);
    }
  }
}
