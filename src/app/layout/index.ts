/**
 * Layout barrel — export all layout shell components from one entry point.
 * Feature modules import from here: import { AdminLayoutComponent } from '../../layout';
 */
export { AdminLayoutComponent } from './admin-layout/admin-layout';
export {
  SidebarComponent,
  SystemDesignSidebarComponent,
} from './sidebar/sidebar';
export type {
  SidebarNavSection,
  SidebarSubItem,
  SystemDesignNavSection,
} from './sidebar/sidebar';
export { SidebarItemComponent } from './sidebar/sidebar-item';
export { SidebarGroupComponent } from './sidebar/sidebar-group';
export { SidebarSubmenuComponent } from './sidebar/sidebar-submenu';
export { HeaderComponent } from './header/header';
export { UserMenuComponent } from './user-menu/user-menu';
export type { UserMenuUser } from './user-menu/user-menu';
export { FooterComponent } from './footer/footer';
export type { FooterLink } from './footer/footer';
