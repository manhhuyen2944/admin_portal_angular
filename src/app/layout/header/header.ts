import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IconComponent,
  NotificationBellComponent,
  ThemeSelectorComponent,
  LanguageSelectorComponent,
} from '../../shared';
import { UserMenuComponent, type UserMenuUser } from '../user-menu/user-menu';
import { TranslationService } from '../../core/services/translation.service';
import { inject } from '@angular/core';

/**
 * HeaderComponent — global site-wide top navigation header.
 * Shared across the entire application (AdminLayout, SystemDesign, etc.).
 *
 * Usage:
 *   <app-header [(sidebarOpen)]="sidebarOpen" (openCommandPalette)="openSearch()" />
 *   <app-header [user]="currentUser" />
 */
@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block shrink-0 w-full z-20',
  },
  imports: [
    CommonModule,
    IconComponent,
    NotificationBellComponent,
    ThemeSelectorComponent,
    LanguageSelectorComponent,
    UserMenuComponent,
  ],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private readonly translation = inject(TranslationService);

  title = input('Admin Portal');
  subtitle = input<string | undefined>(undefined);
  badge = input<string | undefined>(undefined);

  showBrand = input(true);
  showSearch = input(true);
  showNotifications = input(true);
  showThemeSelector = input(true);
  showLanguageSelector = input(true);
  showDensitySelector = input(false);

  user = input<UserMenuUser | null>(null);

  protected readonly searchLabel = computed(() => this.translation.t('common.search'));

  protected readonly defaultUser: UserMenuUser = {
    name: 'Sarah Connor',
    email: 'sarah@cyberdyne.com',
  };

  protected readonly effectiveUser = computed(() => this.user() ?? this.defaultUser);

  /** Two-way model for mobile sidebar drawer toggle */
  sidebarOpen = model(false);

  openCommandPalette = output<void>();
  toggleSidebar = output<void>();
  signOut = output<void>();

  protected toggleSidebarMenu(): void {
    this.sidebarOpen.update((v) => !v);
    this.toggleSidebar.emit();
  }
}
