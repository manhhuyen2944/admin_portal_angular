import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown';
import type { DropdownItem, DropdownAlign } from '../dropdown/dropdown';
import { IconButtonComponent } from '../icon-button/icon-button';
import type { IconName } from '../icon/icon-registry';

/**
 * Menu — action menu (⋮ more-actions pattern) using Dropdown internally.
 * The canonical way to show row actions, context menus, and "more" menus.
 *
 * Usage:
 *   <app-menu [items]="rowActions" (itemClick)="handleAction($event)" />
 *
 *   <!-- Custom trigger: -->
 *   <app-menu [items]="rowActions" triggerIcon="more-horizontal" triggerLabel="More options" />
 *
 * Rules:
 *   - Do NOT create raw Dropdown + icon-button combos in feature templates.
 *   - Always use Menu for the "more actions" pattern.
 */
@Component({
  selector: 'app-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DropdownComponent, IconButtonComponent],
  template: `
    <app-dropdown [items]="items()" [align]="align()" (itemClick)="itemClick.emit($event)">
      <ng-container trigger>
        <app-icon-button
          [name]="triggerIcon()"
          [label]="triggerLabel()"
          variant="ghost"
          size="sm"
        />
      </ng-container>
    </app-dropdown>
  `,
})
export class MenuComponent {
  items = input.required<DropdownItem[]>();
  align = input<DropdownAlign>('right');
  triggerIcon = input<IconName>('ellipsis-vertical');
  triggerLabel = input('More actions');

  itemClick = output<DropdownItem>();
}
