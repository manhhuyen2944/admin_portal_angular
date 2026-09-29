import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ShimmerVariant =
  | 'text'
  | 'title'
  | 'avatar'
  | 'button'
  | 'card'
  | 'table-row'
  | 'table'
  | 'input'
  | 'image'
  | 'custom';

/**
 * LoadingShimmer — the ONLY skeleton loading component.
 * All loading states in the app compose from this component.
 * Never create UserLoadingSkeleton, TableSkeleton, etc. as standalone components.
 *
 * Usage:
 *   <app-loading-shimmer variant="table" />
 *   <app-loading-shimmer variant="text" [lines]="3" />
 *   <app-loading-shimmer variant="avatar" />
 *   <app-loading-shimmer variant="card" />
 *   <!-- Feature skeleton composed from multiple shimmers: -->
 *   <app-loading-shimmer variant="avatar" />
 *   <app-loading-shimmer variant="text" [lines]="2" />
 */
@Component({
  selector: 'app-loading-shimmer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="containerClass()" [attr.aria-hidden]="true" [attr.aria-label]="'Loading...'">
      @switch (variant()) {
        @case ('avatar') {
          <div [class]="shimmerBase() + ' rounded-full ' + avatarSize()"></div>
        }

        @case ('title') {
          <div class="space-y-2">
            <div [class]="shimmerBase() + ' h-6 rounded-md ' + widthClass()"></div>
          </div>
        }

        @case ('text') {
          <div class="space-y-2">
            @for (line of lineArray(); track $index) {
              <div
                [class]="shimmerBase() + ' h-4 rounded ' + (isLastLine($index) ? 'w-3/4' : 'w-full')"
              ></div>
            }
          </div>
        }

        @case ('button') {
          <div [class]="shimmerBase() + ' h-10 rounded-md ' + widthClass()"></div>
        }

        @case ('input') {
          <div class="space-y-1.5">
            <div [class]="shimmerBase() + ' h-4 w-24 rounded'"></div>
            <div [class]="shimmerBase() + ' h-10 rounded-md w-full'"></div>
          </div>
        }

        @case ('card') {
          <div class="rounded-card border border-border p-4 space-y-3">
            <div class="flex items-center gap-3">
              <div [class]="shimmerBase() + ' h-10 w-10 rounded-full'"></div>
              <div class="flex-1 space-y-2">
                <div [class]="shimmerBase() + ' h-4 w-3/4 rounded'"></div>
                <div [class]="shimmerBase() + ' h-3 w-1/2 rounded'"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div [class]="shimmerBase() + ' h-4 w-full rounded'"></div>
              <div [class]="shimmerBase() + ' h-4 w-full rounded'"></div>
              <div [class]="shimmerBase() + ' h-4 w-2/3 rounded'"></div>
            </div>
          </div>
        }

        @case ('table-row') {
          <div class="flex items-center gap-4 py-3 border-b border-border">
            <div [class]="shimmerBase() + ' h-4 w-8 rounded'"></div>
            <div [class]="shimmerBase() + ' h-8 w-8 rounded-full'"></div>
            <div [class]="shimmerBase() + ' h-4 flex-1 rounded'"></div>
            <div [class]="shimmerBase() + ' h-4 w-24 rounded'"></div>
            <div [class]="shimmerBase() + ' h-6 w-16 rounded-full'"></div>
            <div [class]="shimmerBase() + ' h-4 w-20 rounded'"></div>
          </div>
        }

        @case ('table') {
          <div class="rounded-card border border-border overflow-hidden">
            <!-- header -->
            <div class="flex items-center gap-4 px-4 py-3 bg-surface-raised border-b border-border">
              @for (col of [1, 2, 3, 4, 5]; track col) {
                <div [class]="shimmerBase() + ' h-4 flex-1 rounded'"></div>
              }
            </div>
            <!-- rows -->
            @for (row of tableRows(); track $index) {
              <div class="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
                <div [class]="shimmerBase() + ' h-4 w-8 rounded'"></div>
                <div [class]="shimmerBase() + ' h-8 w-8 rounded-full shrink-0'"></div>
                <div [class]="shimmerBase() + ' h-4 flex-1 rounded'"></div>
                <div [class]="shimmerBase() + ' h-4 w-24 rounded'"></div>
                <div [class]="shimmerBase() + ' h-6 w-16 rounded-full'"></div>
                <div [class]="shimmerBase() + ' h-4 w-20 rounded'"></div>
              </div>
            }
          </div>
        }

        @case ('image') {
          <div [class]="shimmerBase() + ' rounded-md ' + imageSize()"></div>
        }

        @default {
          <!-- custom: render a single block with width/height from inputs -->
          <div [class]="shimmerBase() + ' rounded-md'" [style]="customStyle()"></div>
        }
      }
    </div>
  `,
})
export class LoadingShimmerComponent {
  variant = input<ShimmerVariant>('text');
  /** Number of text lines (text variant). Default: 3. */
  lines = input<number>(3);
  /** Whether animation plays. Default: true. */
  animated = input<boolean>(true);
  /** Custom width (custom variant). e.g. '200px', '100%' */
  width = input<string | undefined>(undefined);
  /** Custom height (custom variant). e.g. '48px' */
  height = input<string | undefined>(undefined);
  /** Custom border radius (custom variant). */
  borderRadius = input<string | undefined>(undefined);

  protected readonly shimmerBase = computed(() => {
    const anim = this.animated()
      ? 'animate-pulse'
      : '';
    return `bg-surface-raised ${anim}`.trim();
  });

  protected readonly containerClass = computed(() => 'w-full');

  protected readonly lineArray = computed(() =>
    Array.from({ length: this.lines() })
  );

  protected readonly tableRows = computed(() =>
    Array.from({ length: this.lines() || 5 })
  );

  protected readonly widthClass = computed(() => this.width() ? '' : 'w-full');

  protected readonly avatarSize = computed(() => 'h-10 w-10');
  protected readonly imageSize = computed(() => {
    const w = this.width() ? '' : 'w-full';
    const h = this.height() ? '' : 'h-48';
    return `${w} ${h}`.trim();
  });

  protected readonly customStyle = computed(() => {
    const styles: Record<string, string> = {};
    if (this.width()) styles['width'] = this.width()!;
    if (this.height()) styles['height'] = this.height()!;
    if (this.borderRadius()) styles['border-radius'] = this.borderRadius()!;
    return styles;
  });

  protected isLastLine(index: number): boolean {
    return index === this.lines() - 1;
  }
}
