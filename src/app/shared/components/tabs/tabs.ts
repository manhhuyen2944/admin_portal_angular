import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  effect,
  input,
  model,
  signal,
} from '@angular/core';

/**
 * TabItem — data model for tab definitions.
 * Use either the declarative approach (TabItem[] input) or TabPanel children.
 */
export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
  badge?: string | number;
}

/**
 * Tabs — tabbed navigation with named panels.
 *
 * Usage (data-driven):
 *   <app-tabs [tabs]="tabs" [(activeTab)]="currentTab">
 *     @switch (currentTab) {
 *       @case ('profile') { <app-profile-form /> }
 *       @case ('security') { <app-security-settings /> }
 *     }
 *   </app-tabs>
 *
 * Responsive: tabs scroll horizontally on mobile (overflow-x-auto).
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col">
      <!-- Tab list -->
      <div
        role="tablist"
        class="flex border-b border-border overflow-x-auto scrollbar-none"
        [attr.aria-label]="label()"
      >
        @for (tab of tabs(); track tab.id) {
          <button
            type="button"
            role="tab"
            [id]="'tab-' + tab.id"
            [attr.aria-selected]="activeTab() === tab.id"
            [attr.aria-controls]="'panel-' + tab.id"
            [disabled]="tab.disabled"
            [class]="tabClasses(tab.id)"
            (click)="selectTab(tab)"
          >
            <span class="truncate">{{ tab.label }}</span>
            @if (tab.badge !== undefined) {
              <span class="ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-medium
                           bg-surface-raised text-foreground-secondary leading-none">
                {{ tab.badge }}
              </span>
            }
          </button>
        }
      </div>

      <!-- Panel content -->
      <div
        role="tabpanel"
        [id]="'panel-' + activeTab()"
        [attr.aria-labelledby]="'tab-' + activeTab()"
        class="flex-1 pt-5"
      >
        <ng-content />
      </div>
    </div>
  `,
})
export class TabsComponent {
  tabs = input.required<TabItem[]>();
  activeTab = model<string>('');
  label = input('Tabs');

  constructor() {
    effect(() => {
      const list = this.tabs();
      if (!this.activeTab() && list.length > 0) {
        this.activeTab.set(list[0].id);
      }
    });
  }

  protected tabClasses(id: string): string {
    const base = [
      'inline-flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-medium',
      'border-b-2 -mb-px transition-colors duration-150 whitespace-nowrap',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ');
    const active = this.activeTab() === id
      ? 'border-primary text-primary'
      : 'border-transparent text-foreground-secondary hover:text-foreground hover:border-border';
    return `${base} ${active}`;
  }

  protected selectTab(tab: TabItem): void {
    if (!tab.disabled) this.activeTab.set(tab.id);
  }
}
