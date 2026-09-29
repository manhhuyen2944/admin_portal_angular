import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  DOCUMENT,
  inject,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
export type DrawerPosition = DrawerSide;
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Drawer — slide-in panel from any edge.
 * Mobile: always full-width/height from bottom or left; Desktop: side panel.
 *
 * Usage:
 *   <app-drawer [(open)]="showDrawer" title="Filters" side="right">
 *     <ng-container drawer-body>
 *       <!-- Filters form -->
 *     </ng-container>
 *     <ng-container drawer-footer>
 *       <app-button variant="primary" [fullWidth]="true">Apply</app-button>
 *     </ng-container>
 *   </app-drawer>
 *
 * Rules:
 *   - Sidebar mobile overlay uses Sidebar's internal drawer mode, not this component.
 *   - Use this for content drawers: filters, detail panels, multi-step forms.
 */
@Component({
  selector: 'app-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-[var(--z-drawer)] flex" [class]="alignClass()">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          (click)="handleBackdrop()"
          aria-hidden="true"
        ></div>

        <!-- Panel -->
        <aside
          [class]="panelClasses()"
          role="complementary"
          [attr.aria-label]="title() || 'Drawer'"
          (keydown.escape)="close()"
        >
          <!-- Header -->
          <div class="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
            <div class="min-w-0">
              @if (title()) {
                <h2 class="text-base font-semibold text-foreground truncate">{{ title() }}</h2>
              }
              <ng-content select="[drawer-header]" />
            </div>
            <button
              type="button"
              class="ml-4 shrink-0 flex h-8 w-8 items-center justify-center rounded-md text-muted
                     hover:text-foreground hover:bg-surface-raised transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Close"
              (click)="close()"
            >
              <app-icon name="x" size="sm" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 py-5">
            <ng-content select="[drawer-body]" />
            <ng-content />
          </div>

          <!-- Footer -->
          <div class="shrink-0 border-t border-border px-5 py-4">
            <ng-content select="[drawer-footer]" />
          </div>
        </aside>
      </div>
    }
  `,
})
export class DrawerComponent {
  open = model(false);
  side = input<DrawerSide>('right');
  /** Alias for side input (e.g. position="left") */
  position = input<DrawerPosition | undefined>(undefined);
  size = input<DrawerSize>('md');
  title = input<string | undefined>(undefined);
  closeOnBackdrop = input(true);

  closed = output<void>();

  private readonly doc = inject(DOCUMENT);

  constructor() {
    effect(() => {
      this.doc.body.style.overflow = this.open() ? 'hidden' : '';
    });
  }

  protected readonly currentSide = computed<DrawerSide>(() => {
    return this.position() ?? this.side();
  });

  protected readonly alignClass = computed(() => {
    const map: Record<DrawerSide, string> = {
      left:   'items-stretch justify-start',
      right:  'items-stretch justify-end',
      top:    'flex-col items-stretch justify-start',
      bottom: 'flex-col items-stretch justify-end',
    };
    return map[this.currentSide()];
  });

  protected readonly panelClasses = computed(() => {
    const side = this.currentSide();
    const isHorizontal = side === 'left' || side === 'right';

    const sizeMap: Record<DrawerSize, string> = {
      sm:   isHorizontal ? 'w-72'   : 'h-64',
      md:   isHorizontal ? 'w-80'   : 'h-96',
      lg:   isHorizontal ? 'w-[28rem]' : 'h-[28rem]',
      xl:   isHorizontal ? 'w-[36rem]' : 'h-[36rem]',
      full: isHorizontal ? 'w-screen' : 'h-screen',
    };

    const slideClass: Record<DrawerSide, string> = {
      left:   'animate-in slide-in-from-left duration-300',
      right:  'animate-in slide-in-from-right duration-300',
      top:    'animate-in slide-in-from-top duration-300',
      bottom: 'animate-in slide-in-from-bottom duration-300',
    };

    const base = 'relative flex flex-col bg-surface shadow-xl z-10';
    const maxW = isHorizontal ? 'max-w-[90vw]' : 'max-h-[90dvh]';

    return `${base} ${sizeMap[this.size()]} ${maxW} ${slideClass[side]}`;
  });

  protected handleBackdrop(): void {
    if (this.closeOnBackdrop()) this.close();
  }

  protected close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
