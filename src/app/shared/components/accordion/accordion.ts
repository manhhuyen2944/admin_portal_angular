import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

export interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  /** Whether this item starts expanded. */
  defaultOpen?: boolean;
}

/**
 * Accordion — collapsible content sections.
 * Single (only one open at a time) or multiple mode.
 *
 * Usage:
 *   <app-accordion [items]="faqItems" />
 *
 *   <!-- Or use app-accordion-item directly for custom content: -->
 *   <app-accordion>
 *     <app-accordion-item title="Section 1">
 *       <app-form-field label="Name"><app-input /></app-form-field>
 *     </app-accordion-item>
 *   </app-accordion>
 */
@Component({
  selector: 'app-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="border-b border-border last:border-0">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 px-4 sm:px-5 py-3.5 text-left
               hover:text-primary transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
        [attr.aria-expanded]="open()"
        (click)="toggle()"
      >
        <div class="min-w-0">
          <span class="text-sm font-semibold text-foreground">{{ title() }}</span>
          @if (subtitle()) {
            <span class="ml-2 text-xs text-muted">{{ subtitle() }}</span>
          }
        </div>
        <app-icon
          name="chevron-down"
          size="sm"
          class="shrink-0 text-muted transition-transform duration-200"
          [class.rotate-180]="open()"
        />
      </button>

      @if (open()) {
        <div class="px-4 sm:px-5 pb-4 pt-1 text-sm text-foreground-secondary">
          <ng-content />
        </div>
      }
    </div>
  `,
})
export class AccordionItemComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>(undefined);
  open = model(false);

  protected toggle(): void { this.open.update(v => !v); }
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccordionItemComponent],
  template: `
    <div class="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
      <!-- Named items -->
      @for (item of items(); track item.id) {
        <app-accordion-item
          [title]="item.title"
          [subtitle]="item.subtitle"
          [open]="isOpen(item.id)"
          (openChange)="toggleItem(item.id, $event)"
        >
          @if (item.content) {
            <p>{{ item.content }}</p>
          }
        </app-accordion-item>
      }
      <!-- Slot for manual accordion-items -->
      <ng-content />
    </div>
  `,
})
export class AccordionComponent {
  items = input<AccordionItem[]>([]);
  /** 'single' — only one open at a time. 'multiple' — all can be open. */
  mode = input<'single' | 'multiple'>('single');

  protected readonly openState = signal<Record<string, boolean>>({});

  protected isOpen(id: string): boolean {
    return !!this.openState()[id];
  }

  protected toggleItem(id: string, open: boolean): void {
    this.openState.update((prev: Record<string, boolean>) => {
      if (this.mode() === 'single') {
        return open ? { [id]: true } : {};
      }
      return { ...prev, [id]: open };
    });
  }
}
