import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/components/icon/icon';
import type { IconName } from '../../shared/components/icon/icon-registry';

/**
 * SidebarSubmenu — Collapsible accordion dropdown item for nested sidebar navigation.
 *
 * Usage:
 *   <app-sidebar-submenu label="Catalog" icon="grid">
 *     <app-sidebar-item label="Buttons" link="/buttons" />
 *     <app-sidebar-item label="Forms" link="/forms" />
 *   </app-sidebar-submenu>
 */
@Component({
  selector: 'app-sidebar-submenu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-1">
      <!-- Submenu Parent Trigger Button -->
      <button
        type="button"
        class="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-text
               transition-all duration-150 hover:bg-sidebar-hover hover:text-white cursor-pointer select-none
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 text-left"
        [class.justify-center]="collapsed()"
        [attr.title]="collapsed() ? label() : null"
        [attr.aria-expanded]="open()"
        (click)="toggleOpen()"
      >
        @if (icon()) {
          <app-icon
            [name]="icon()!"
            size="sm"
            class="shrink-0 opacity-75 group-hover:opacity-100 transition-opacity"
          />
        }

        @if (!collapsed()) {
          <span class="truncate flex-1 font-medium leading-none">{{ label() }}</span>

          @if (badge()) {
            <span class="text-[10px] font-mono bg-primary/20 text-primary-light px-1.5 py-0.5 rounded-full leading-none shrink-0">
              {{ badge() }}
            </span>
          }

          <app-icon
            name="chevron-down"
            size="xs"
            class="text-muted transition-transform duration-200 shrink-0"
            [class.rotate-180]="open()"
          />
        }
      </button>

      <!-- Submenu Child Items Container -->
      @if (open() && !collapsed()) {
        <div class="pl-4 pr-1 py-1 space-y-1 border-l-2 border-border/40 ml-4.5 animate-in slide-in-from-top-2 duration-150">
          <ng-content />
        </div>
      }
    </div>
  `,
})
export class SidebarSubmenuComponent {
  /** Menu label displayed in parent button */
  label = input.required<string>();

  /** Optional icon name */
  icon = input<IconName | undefined>(undefined);

  /** Optional badge */
  badge = input<string | number | undefined>(undefined);

  /** Whether the parent sidebar is collapsed in rail mode */
  collapsed = input(false);

  /** Two-way open state for collapsible submenu */
  open = model(false);

  toggleOpen(): void {
    this.open.update((v) => !v);
  }
}
