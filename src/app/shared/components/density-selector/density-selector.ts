import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnInit,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { DropdownComponent, DropdownItem } from '../dropdown/dropdown';

export type AppDensity = 'compact' | 'comfortable' | 'spacious';

/**
 * DensitySelector — controls UI spacing density (table padding, list spacing, font scales).
 * Sets `data-density` attribute on `document.documentElement` for global styling.
 *
 * Usage:
 *   <app-density-selector [(density)]="uiDensity" />
 */
@Component({
  selector: 'app-density-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, DropdownComponent],
  template: `
    @if (variant() === 'segmented') {
      <div class="inline-flex items-center rounded-xl p-1 bg-surface-raised border border-border">
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-medium rounded-lg transition-colors"
          [class]="density() === 'compact' ? 'bg-surface text-primary shadow-xs font-semibold' : 'text-muted hover:text-foreground'"
          (click)="setDensity('compact')"
        >
          Compact
        </button>
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-medium rounded-lg transition-colors"
          [class]="density() === 'comfortable' ? 'bg-surface text-primary shadow-xs font-semibold' : 'text-muted hover:text-foreground'"
          (click)="setDensity('comfortable')"
        >
          Comfortable
        </button>
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-medium rounded-lg transition-colors"
          [class]="density() === 'spacious' ? 'bg-surface text-primary shadow-xs font-semibold' : 'text-muted hover:text-foreground'"
          (click)="setDensity('spacious')"
        >
          Spacious
        </button>
      </div>
    } @else {
      <!-- Dropdown mode -->
      <app-dropdown [items]="dropdownItems" align="right" (itemClick)="handleDropdown($event)">
        <ng-container trigger>
          <button
            type="button"
            class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border border-border bg-surface hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            [attr.aria-label]="'Current display density: ' + density()"
          >
            <app-icon name="sliders" size="xs" class="text-muted" />
            <span class="capitalize text-foreground font-semibold">{{ density() }}</span>
            <app-icon name="chevron-down" size="xs" class="text-muted -mr-0.5" />
          </button>
        </ng-container>
      </app-dropdown>
    }
  `,
})
export class DensitySelectorComponent implements OnInit {
  variant = input<'segmented' | 'dropdown'>('dropdown');
  density = model<AppDensity>('comfortable');

  private readonly platformId = inject(PLATFORM_ID);

  protected readonly dropdownItems: DropdownItem[] = [
    { id: 'compact', label: 'Compact' },
    { id: 'comfortable', label: 'Comfortable (Default)' },
    { id: 'spacious', label: 'Spacious' },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('app-density') as AppDensity | null;
      if (saved && ['compact', 'comfortable', 'spacious'].includes(saved)) {
        this.density.set(saved);
      }
      this.applyDensity(this.density());
    }
  }

  setDensity(value: AppDensity): void {
    this.density.set(value);
    this.applyDensity(value);
  }

  protected handleDropdown(item: DropdownItem): void {
    this.setDensity(item.id as AppDensity);
  }

  private applyDensity(val: AppDensity): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('app-density', val);
      document.documentElement.setAttribute('data-density', val);
    }
  }
}
