import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: IconName;
  description?: string;
  disabled?: boolean;
  danger?: boolean;
  dividerAfter?: boolean;
}

export type DropdownAlign = 'left' | 'right';
export type DropdownTrigger = 'click' | 'hover';

/**
 * Dropdown — reusable positioned dropdown menu.
 * Phase 4 replacement for ad-hoc click-toggle patterns in Select, UserMenu.
 *
 * Usage:
 *   <!-- With trigger slot: -->
 *   <app-dropdown [items]="actions" (itemClick)="handleAction($event)">
 *     <ng-container trigger>
 *       <app-button variant="outline" icon="chevron-down">Actions</app-button>
 *     </ng-container>
 *   </app-dropdown>
 *
 *   <!-- Icon button trigger: -->
 *   <app-dropdown [items]="rowActions" align="right">
 *     <ng-container trigger>
 *       <app-icon-button name="more-vertical" label="Row actions" variant="ghost" />
 *     </ng-container>
 *   </app-dropdown>
 *
 *   <!-- Custom content instead of items: -->
 *   <app-dropdown [items]="[]">
 *     <ng-container trigger><app-button>Open</app-button></ng-container>
 *     <ng-container content>
 *       <!-- arbitrary content -->
 *     </ng-container>
 *   </app-dropdown>
 */
@Component({
  selector: 'app-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="relative inline-block" (keydown.escape)="close()">
      <!-- Trigger slot -->
      <div (click)="toggle()" class="cursor-pointer">
        <ng-content select="[trigger]" />
      </div>

      <!-- Dropdown panel -->
      @if (isOpen()) {
        <div class="fixed inset-0 z-[var(--z-dropdown)]" (click)="close()"></div>
        <div
          [class]="panelClasses()"
          role="menu"
          (click)="$event.stopPropagation()"
        >
          <!-- Custom content slot -->
          <ng-content select="[content]" />

          <!-- Items list -->
          @if (items().length > 0) {
            <div class="py-1">
              @for (item of items(); track item.id) {
                <button
                  type="button"
                  [disabled]="item.disabled"
                  [class]="itemClasses(item)"
                  role="menuitem"
                  (click)="handleItemClick(item)"
                >
                  @if (item.icon) {
                    <app-icon [name]="item.icon" size="sm" class="shrink-0" />
                  }
                  <div class="flex-1 text-left min-w-0">
                    <span class="block truncate">{{ item.label }}</span>
                    @if (item.description) {
                      <span class="block text-xs text-muted truncate">{{ item.description }}</span>
                    }
                  </div>
                </button>

                @if (item.dividerAfter) {
                  <div class="my-1 border-t border-border"></div>
                }
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DropdownComponent {
  items = input<DropdownItem[]>([]);
  align = input<DropdownAlign>('left');
  minWidth = input('12rem');

  open = model(false);
  itemClick = output<DropdownItem>();

  protected readonly isOpen = computed(() => this.open());

  protected readonly panelClasses = computed(() => {
    const base = [
      'absolute top-full mt-1 z-[calc(var(--z-dropdown)+1)]',
      'rounded-xl border border-border bg-surface shadow-xl',
      'overflow-hidden',
      'animate-in fade-in-0 zoom-in-95 duration-100',
    ].join(' ');
    const align = this.align() === 'right' ? 'right-0' : 'left-0';
    return `${base} ${align}`;
  });

  protected itemClasses(item: DropdownItem): string {
    const base = 'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors';
    const color = item.danger
      ? 'text-danger hover:bg-danger/5'
      : 'text-foreground hover:bg-surface-raised';
    const disabled = item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    return `${base} ${color} ${disabled}`;
  }

  protected toggle(): void { this.open.update(v => !v); }
  protected close(): void { this.open.set(false); }

  protected handleItemClick(item: DropdownItem): void {
    if (item.disabled) return;
    this.itemClick.emit(item);
    this.close();
  }
}
