import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IconComponent,
  type IconName,
  LanguageSelectorComponent,
  ThemeSelectorComponent,
} from '../../shared';

/**
 * AuthV2LayoutComponent — Centered card layout for Auth Version 2.
 *
 * Features:
 * - Centered card container (max-w-md)
 * - Pure CSS Dark / Light ambient background without bitmap photo images
 * - Top-right LanguageSelector and ThemeSelector
 * - Responsive padding and smooth micro-interactions
 */
@Component({
  selector: 'app-auth-v2-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    LanguageSelectorComponent,
    ThemeSelectorComponent,
  ],
  template: `
    <div class="min-h-screen w-full flex flex-col justify-between bg-background text-foreground relative overflow-hidden select-none">
      <!-- Ambient Background Glows (Dark & Light Mode, No Images) -->
      <div class="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/15 blur-3xl"></div>
      <div class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] dark:bg-primary/[0.06] blur-3xl"></div>

      <!-- Top Utility Header (Brand + Language & Theme Switchers) -->
      <header class="w-full flex items-center justify-between px-4 sm:px-8 py-5 z-20">
        <!-- Brand Logo -->
        <a routerLink="/auth-v2/login" class="flex items-center gap-2.5 group cursor-pointer">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
            <app-icon [name]="icon()" size="sm" />
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold tracking-tight text-foreground">Admin Portal</span>
            <span class="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold">V2</span>
          </div>
        </a>

        <!-- Controls: Language & Theme Switchers -->
        <div class="flex items-center gap-2">
          <app-language-selector />
          <app-theme-selector />
        </div>
      </header>

      <!-- Center Main: Auth Card -->
      <main class="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 z-10 w-full">
        <div class="w-full max-w-md mx-auto">
          <!-- Card Container -->
          <div class="rounded-2xl border border-border bg-surface/95 backdrop-blur-md shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50 zoom-in-95 duration-200">
            <!-- Header Block inside Card -->
            <div class="text-center space-y-2">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-1 shadow-xs">
                <app-icon [name]="icon()" size="md" />
              </div>
              <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{{ title() }}</h1>
              @if (subtitle()) {
                <p class="text-xs sm:text-sm text-muted leading-relaxed">{{ subtitle() }}</p>
              }
            </div>

            <!-- Content Slot -->
            <div class="space-y-4">
              <ng-content />
            </div>

            <!-- Footer Slot inside Card (optional) -->
            <ng-content select="[card-footer]" />
          </div>

          <!-- Outer Auth Footer links -->
          <div class="mt-6 text-center text-xs text-muted">
            <ng-content select="[auth-footer]" />
          </div>
        </div>
      </main>

      <!-- Bottom Page Footer -->
      <footer class="w-full text-center py-4 text-xs text-muted z-10">
        <p>&copy; 2026 Admin Portal &bull; Enterprise Security Architecture</p>
      </footer>
    </div>
  `,
})
export class AuthV2LayoutComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>(undefined);
  icon = input<IconName>('shield');
}
