import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'h-6 w-6',   text: 'text-xs' },
  sm: { container: 'h-8 w-8',   text: 'text-xs' },
  md: { container: 'h-10 w-10', text: 'text-sm' },
  lg: { container: 'h-12 w-12', text: 'text-base' },
  xl: { container: 'h-16 w-16', text: 'text-xl' },
};

/** Deterministic color from name initials */
const COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-amber-500',  'bg-rose-500',   'bg-cyan-500', 'bg-teal-500',
];
function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

/**
 * Avatar — user/entity avatar with image + initials fallback.
 * Deterministic background color derived from the name.
 *
 * Usage:
 *   <app-avatar name="John Doe" />
 *   <app-avatar name="Jane Smith" [src]="user.avatarUrl" size="lg" />
 *   <app-avatar name="System" size="sm" shape="square" />
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="containerClasses()" [attr.title]="name()" [attr.aria-label]="name()">
      @if (src() && !imgError()) {
        <img
          [src]="src()"
          [alt]="name()"
          class="h-full w-full object-cover"
          (error)="imgError.set(true)"
        />
      } @else {
        <span [class]="'font-semibold text-white select-none ' + sizeConfig().text">
          {{ initials() }}
        </span>
      }
    </div>
  `,
})
export class AvatarComponent {
  name = input.required<string>();
  src = input<string | undefined>(undefined);
  size = input<AvatarSize>('md');
  shape = input<'circle' | 'square'>('circle');

  protected readonly imgError = signal(false);

  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : this.name().slice(0, 2).toUpperCase();
  });

  protected readonly sizeConfig = computed(() => SIZE_CLASSES[this.size()]);

  protected readonly containerClasses = computed(() => {
    const { container } = this.sizeConfig();
    const shape = this.shape() === 'square' ? 'rounded-lg' : 'rounded-full';
    const bg = colorFromName(this.name());
    return `inline-flex shrink-0 items-center justify-center overflow-hidden ${container} ${shape} ${bg}`;
  });
}

/**
 * AvatarGroup — overlapping stack of avatars with "+N" overflow.
 *
 * Usage:
 *   <app-avatar-group [users]="members" [max]="4" size="sm" />
 */
@Component({
  selector: 'app-avatar-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent],
  template: `
    <div class="flex items-center -space-x-2">
      @for (user of visible(); track user.name) {
        <div class="ring-2 ring-surface rounded-full">
          <app-avatar [name]="user.name" [src]="user.src" [size]="size()" />
        </div>
      }
      @if (overflow() > 0) {
        <div
          [class]="overflowClasses()"
          [attr.title]="'+' + overflow() + ' more'"
          aria-hidden="true"
        >
          <span class="text-xs font-medium text-foreground-secondary">+{{ overflow() }}</span>
        </div>
      }
    </div>
  `,
})
export class AvatarGroupComponent {
  users = input.required<Array<{ name: string; src?: string }>>() ;
  max = input(4);
  size = input<AvatarSize>('sm');

  protected readonly visible = computed(() => this.users().slice(0, this.max()));
  protected readonly overflow = computed(() => Math.max(0, this.users().length - this.max()));

  protected overflowClasses(): string {
    const base = SIZE_CLASSES[this.size()].container;
    return `inline-flex shrink-0 items-center justify-center rounded-full bg-surface-raised border-2 border-surface ${base}`;
  }
}
