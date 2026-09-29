import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';
import { IconButtonComponent } from '../icon-button/icon-button';
import { DropdownComponent, DropdownItem } from '../dropdown/dropdown';

export type AppTheme = 'light' | 'dark';

/**
 * ThemeSelector — controls light / dark color scheme.
 * Supports only Light and Dark modes (no system icon).
 *
 * Usage:
 *   <!-- Icon button toggle (quick switch light/dark) -->
 *   <app-theme-selector variant="toggle" />
 *
 *   <!-- Segmented 2-button pill -->
 *   <app-theme-selector variant="segmented" />
 *
 *   <!-- Dropdown selector -->
 *   <app-theme-selector variant="dropdown" />
 */
@Component({
  selector: 'app-theme-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, IconButtonComponent, DropdownComponent],
  template: `
    @if (variant() === 'toggle') {
      <app-icon-button
        [name]="toggleIcon()"
        [label]="'Current theme: ' + theme() + '. Click to switch to ' + (theme() === 'dark' ? 'Light' : 'Dark')"
        variant="ghost"
        size="sm"
        class="cursor-pointer"
        (click)="cycleToggle()"
      />
    } @else if (variant() === 'segmented') {
      <div class="inline-flex items-center rounded-xl p-1 bg-surface-raised border border-border">
        <button
          type="button"
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          [class]="theme() === 'light' ? 'bg-surface text-primary shadow-xs font-semibold' : 'text-muted hover:text-foreground'"
          (click)="setTheme('light')"
          title="Light theme"
        >
          <app-icon name="sun" size="xs" />
          <span>Light</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          [class]="theme() === 'dark' ? 'bg-surface text-primary shadow-xs font-semibold' : 'text-muted hover:text-foreground'"
          (click)="setTheme('dark')"
          title="Dark theme"
        >
          <app-icon name="moon" size="xs" />
          <span>Dark</span>
        </button>
      </div>
    } @else {
      <!-- Dropdown mode -->
      <app-dropdown [items]="dropdownItems" align="right" (itemClick)="handleDropdown($event)">
        <ng-container trigger>
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl border border-border bg-surface hover:bg-surface-raised transition-colors cursor-pointer"
          >
            <app-icon [name]="toggleIcon()" size="xs" class="text-primary" />
            <span class="capitalize">{{ theme() }}</span>
            <app-icon name="chevron-down" size="xs" class="text-muted" />
          </button>
        </ng-container>
      </app-dropdown>
    }
  `,
})
export class ThemeSelectorComponent implements OnInit {
  variant = input<'toggle' | 'segmented' | 'dropdown'>('toggle');

  private readonly platformId = inject(PLATFORM_ID);

  readonly theme = signal<AppTheme>('light');
  readonly isDark = signal(false);

  protected readonly dropdownItems: DropdownItem[] = [
    { id: 'light', label: 'Light', icon: 'sun' },
    { id: 'dark', label: 'Dark', icon: 'moon' },
  ];

  protected toggleIcon(): IconName {
    return this.theme() === 'dark' ? 'moon' : 'sun';
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('app-theme') as AppTheme | null;
      if (saved && (saved === 'light' || saved === 'dark')) {
        this.theme.set(saved);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.theme.set(prefersDark ? 'dark' : 'light');
      }
      this.applyTheme(this.theme());
    }
  }

  setTheme(newTheme: AppTheme): void {
    this.theme.set(newTheme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('app-theme', newTheme);
      this.applyTheme(newTheme);
    }
  }

  cycleToggle(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  protected handleDropdown(item: DropdownItem): void {
    this.setTheme(item.id as AppTheme);
  }

  private applyTheme(mode: AppTheme): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const dark = mode === 'dark';
    this.isDark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
  }
}
