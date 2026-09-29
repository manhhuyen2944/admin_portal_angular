import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';

export type PopoverAlign = 'left' | 'right' | 'center';
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverPosition = PopoverSide;

/**
 * Popover — non-modal floating content panel anchored to a trigger.
 * Unlike Dropdown (menu items), Popover renders arbitrary content (forms, previews).
 *
 * Usage:
 *   <app-popover>
 *     <ng-container trigger>
 *       <app-button variant="outline">Filter</app-button>
 *     </ng-container>
 *     <ng-container content>
 *       <div class="p-4 space-y-3">
 *         <app-checkbox label="Show archived" />
 *         <app-button variant="primary" size="sm" [fullWidth]="true">Apply</app-button>
 *       </div>
 *     </ng-container>
 *   </app-popover>
 */
@Component({
  selector: 'app-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block" (keydown.escape)="close()">
      <!-- Trigger -->
      <div (click)="toggle()" class="cursor-pointer">
        <ng-content select="[trigger]" />
      </div>

      @if (open()) {
        <!-- Backdrop (transparent) -->
        <div class="fixed inset-0 z-[var(--z-dropdown)]" (click)="close()"></div>

        <!-- Popover panel -->
        <div
          [class]="panelClasses()"
          role="dialog"
          [attr.aria-modal]="false"
          (click)="$event.stopPropagation()"
        >
          <!-- Optional header -->
          @if (title()) {
            <div class="border-b border-border px-4 py-3">
              <h3 class="text-sm font-semibold text-foreground">{{ title() }}</h3>
            </div>
          }

          <!-- Content slot -->
          <ng-content select="[content]" />
          <ng-content />
        </div>
      }
    </div>
  `,
})
export class PopoverComponent {
  open = model(false);
  title = input<string | undefined>(undefined);
  align = input<PopoverAlign>('left');
  side = input<PopoverSide>('bottom');
  maxWidth = input('320px');

  closed = output<void>();

  protected readonly panelClasses = computed(() => {
    const base = [
      'absolute z-[calc(var(--z-dropdown)+1)]',
      'rounded-xl border border-border bg-surface shadow-xl overflow-hidden',
      'animate-in fade-in-0 zoom-in-95 duration-100',
    ].join(' ');

    const alignClass = {
      left:   'left-0',
      right:  'right-0',
      center: 'left-1/2 -translate-x-1/2',
    }[this.align()];

    const sideClass = {
      bottom: 'top-full mt-2',
      top:    'bottom-full mb-2',
      left:   'right-full mr-2 top-0',
      right:  'left-full ml-2 top-0',
    }[this.side()];

    return `${base} ${alignClass} ${sideClass}`;
  });

  protected toggle(): void { this.open.update(v => !v); }
  protected close(): void { this.open.set(false); this.closed.emit(); }
}
