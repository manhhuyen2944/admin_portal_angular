import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  OnInit,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: IconName;
  group?: string;
  shortcut?: string[];
  link?: string;
  handler?: () => void;
}

const DEFAULT_COMMANDS: CommandItem[] = [
  // Navigation
  { id: 'nav-dashboard', title: 'Dashboard', subtitle: 'View main overview metrics', icon: 'layout-dashboard', group: 'Navigation', shortcut: ['G', 'D'], link: '/system-design' },
  { id: 'nav-system', title: 'System Design', subtitle: 'Component catalog & documentation', icon: 'layout-dashboard', group: 'Navigation', shortcut: ['G', 'S'], link: '/system-design' },
  { id: 'nav-users', title: 'User Management', subtitle: 'Manage team members and roles', icon: 'users', group: 'Navigation', shortcut: ['G', 'U'], link: '/system-design' },
  { id: 'nav-reports', title: 'Reports & Analytics', subtitle: 'Export periodic performance summaries', icon: 'file-text', group: 'Navigation', shortcut: ['G', 'R'], link: '/system-design' },
  { id: 'nav-settings', title: 'Portal Settings', subtitle: 'System preferences and branding', icon: 'settings', group: 'Navigation', shortcut: ['G', 'P'], link: '/system-design' },

  // Error Pages
  { id: 'err-403', title: '403 Access Denied', subtitle: 'Preview Access Denied error screen', icon: 'shield', group: 'Error Pages', link: '/403' },
  { id: 'err-404', title: '404 Page Not Found', subtitle: 'Preview Page Not Found error screen', icon: 'globe', group: 'Error Pages', link: '/404' },

  // Actions
  { id: 'act-invite', title: 'Invite New User', subtitle: 'Send an email invitation', icon: 'plus', group: 'Quick Actions' },
  { id: 'act-export', title: 'Export Data', subtitle: 'Download current dataset as CSV', icon: 'download', group: 'Quick Actions' },
  { id: 'act-lock', title: 'Lock Screen', subtitle: 'Lock current admin session', icon: 'lock', group: 'Quick Actions', shortcut: ['Ctrl', 'L'], link: '/auth/lock-screen' },

  // Help & Info
  { id: 'help-docs', title: 'Documentation', subtitle: 'Browse portal design system guides', icon: 'file', group: 'Help' },
  { id: 'help-support', title: 'Contact Support', subtitle: 'Reach out to technical helpdesk', icon: 'mail', group: 'Help' },
];

/**
 * CommandPalette — spotlight command search and quick navigation modal.
 * Fully responsive across mobile, tablet, and desktop screens.
 * Triggered via shortcut (Cmd+K / Ctrl+K) or trigger button.
 */
@Component({
  selector: 'app-command-palette',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IconComponent, TranslatePipe],
  template: `
    @if (open()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-[var(--z-dialog,50)] bg-black/60 backdrop-blur-xs transition-opacity duration-150 animate-in fade-in-0"
        (click)="closePalette()"
      ></div>

      <!-- Spotlight dialog panel -->
      <div
        class="fixed top-4 sm:top-20 inset-x-2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[calc(var(--z-dialog,50)+1)]
               w-auto sm:w-full sm:max-w-xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden
               animate-in zoom-in-95 fade-in-0 duration-150 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[75vh]"
        (click)="$event.stopPropagation()"
        (keydown)="handleKeydown($event)"
      >
        <!-- Search bar -->
        <div class="relative flex items-center gap-2 px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-border bg-surface">
          <app-icon name="search" size="sm" class="text-muted shrink-0" />
          <input
            #searchInput
            type="text"
            [(ngModel)]="searchQuery"
            [placeholder]="'search.placeholder' | translate"
            class="flex-1 bg-transparent text-base sm:text-sm font-medium text-foreground placeholder:text-muted focus:outline-none min-w-0"
          />
          @if (searchQuery()) {
            <button
              type="button"
              class="text-xs text-muted hover:text-foreground px-2 py-1 rounded hover:bg-surface-raised cursor-pointer"
              (click)="clearSearch()"
            >
              {{ 'search.clear' | translate }}
            </button>
          }

          <!-- Mobile Close Button -->
          <button
            type="button"
            class="sm:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-raised cursor-pointer shrink-0"
            aria-label="Close search"
            (click)="closePalette()"
          >
            <app-icon name="x" size="xs" />
          </button>

          <!-- Desktop ESC Hint -->
          <span class="hidden sm:inline-block text-[11px] font-mono text-muted border border-border px-1.5 py-0.5 rounded bg-surface-raised select-none shrink-0">
            ESC
          </span>
        </div>

        <!-- Command results list -->
        <div class="flex-1 overflow-y-auto p-2 space-y-4 overscroll-contain">
          @if (filteredGroups().length === 0) {
            <div class="py-10 sm:py-12 text-center text-muted px-4">
              <app-icon name="search" size="md" class="mx-auto mb-2 opacity-40" />
              <p class="text-sm font-medium">
                {{ 'search.noResults' | translate }} "{{ searchQuery() }}"
              </p>
              <p class="text-xs mt-1 text-muted/80">
                {{ 'search.trySearching' | translate }}
              </p>
            </div>
          } @else {
            @for (group of filteredGroups(); track group.name) {
              <div>
                <span class="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted select-none">
                  {{ group.name }}
                </span>
                <div class="mt-1 space-y-1">
                  @for (item of group.items; track item.id) {
                    <div
                      [class]="itemClasses(item)"
                      (mouseenter)="setHover(item)"
                      (click)="selectItem(item)"
                    >
                      <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        @if (item.icon) {
                          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised border border-border/50 text-muted">
                            <app-icon [name]="item.icon" size="sm" />
                          </div>
                        }
                        <div class="min-w-0 flex-1">
                          <p class="text-xs sm:text-sm font-semibold text-foreground truncate">{{ item.title }}</p>
                          @if (item.subtitle) {
                            <p class="text-[11px] text-muted truncate">{{ item.subtitle }}</p>
                          }
                        </div>
                      </div>

                      @if (item.shortcut) {
                        <div class="hidden sm:flex items-center gap-1 shrink-0">
                          @for (key of item.shortcut; track key) {
                            <kbd class="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border border-border bg-surface text-muted">
                              {{ key }}
                            </kbd>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>

        <!-- Footer hints: desktop shortcuts vs mobile touch hint -->
        <div class="px-3.5 sm:px-4 py-2 border-t border-border bg-surface-raised/50 flex items-center justify-between text-[11px] text-muted select-none">
          <div class="hidden sm:flex items-center gap-3">
            <span class="inline-flex items-center gap-1">
              <kbd class="px-1 py-0.5 rounded border border-border bg-surface font-mono text-[10px]">↑</kbd>
              <kbd class="px-1 py-0.5 rounded border border-border bg-surface font-mono text-[10px]">↓</kbd>
              {{ 'search.navigate' | translate }}
            </span>
            <span class="inline-flex items-center gap-1">
              <kbd class="px-1 py-0.5 rounded border border-border bg-surface font-mono text-[10px]">↵</kbd>
              {{ 'search.select' | translate }}
            </span>
            <span class="inline-flex items-center gap-1">
              <kbd class="px-1 py-0.5 rounded border border-border bg-surface font-mono text-[10px]">ESC</kbd>
              {{ 'search.close' | translate }}
            </span>
          </div>

          <span class="sm:hidden text-[11px] text-muted">
            {{ 'search.tapToSelect' | translate }}
          </span>

          <span class="text-[10px] sm:text-[11px] font-medium text-muted/80">
            {{ flatFiltered().length }} {{ 'search.results' | translate }}
          </span>
        </div>
      </div>
    }
  `,
})
export class CommandPaletteComponent implements OnInit {
  commands = input<CommandItem[]>(DEFAULT_COMMANDS);
  open = model(false);

  commandSelect = output<CommandItem>();

  protected searchQuery = signal('');
  protected activeIndex = signal(0);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly flatFiltered = computed<CommandItem[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.commands();
    if (!q) return list;

    return list.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.group && item.group.toLowerCase().includes(q))
    );
  });

  protected readonly filteredGroups = computed<{ name: string; items: CommandItem[] }[]>(() => {
    const items = this.flatFiltered();
    const map = new Map<string, CommandItem[]>();

    for (const item of items) {
      const g = item.group || 'Commands';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }

    return Array.from(map.entries()).map(([name, groupItems]) => ({
      name,
      items: groupItems,
    }));
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const handleGlobalKeydown = (e: KeyboardEvent) => {
        // Cmd+K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.open.update(v => !v);
          if (this.open()) {
            setTimeout(() => this.searchInput()?.nativeElement.focus(), 50);
          }
        }
      };

      window.addEventListener('keydown', handleGlobalKeydown);
      this.destroyRef.onDestroy(() => window.removeEventListener('keydown', handleGlobalKeydown));
    }
  }

  protected closePalette(): void {
    this.open.set(false);
    this.searchQuery.set('');
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.searchInput()?.nativeElement.focus();
  }

  protected itemClasses(item: CommandItem): string {
    const items = this.flatFiltered();
    const isSelected = items[this.activeIndex()]?.id === item.id;
    const base = 'flex items-center justify-between gap-3 px-3 py-2.5 sm:py-2 rounded-xl cursor-pointer transition-colors';
    const active = isSelected
      ? 'bg-primary/10 text-primary'
      : 'hover:bg-surface-raised active:bg-surface-raised text-foreground';
    return `${base} ${active}`;
  }

  protected setHover(item: CommandItem): void {
    const idx = this.flatFiltered().findIndex(i => i.id === item.id);
    if (idx !== -1) this.activeIndex.set(idx);
  }

  protected selectItem(item: CommandItem): void {
    if (item.link) {
      this.router.navigateByUrl(item.link);
    }
    item.handler?.();
    this.commandSelect.emit(item);
    this.closePalette();
  }

  protected handleKeydown(e: KeyboardEvent): void {
    const items = this.flatFiltered();
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex.update(i => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex.update(i => (i - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = items[this.activeIndex()];
      if (current) this.selectItem(current);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.closePalette();
    }
  }
}
