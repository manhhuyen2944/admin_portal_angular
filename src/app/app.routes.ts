import { Routes } from '@angular/router';
import { SystemDesignComponent } from './pages/system-design/system-design';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'system-design', component: SystemDesignComponent },
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent),
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify-email/verify-email').then(m => m.VerifyEmailComponent),
      },
      {
        path: 'verify-otp',
        loadComponent: () => import('./features/auth/verify-email/verify-email').then(m => m.VerifyEmailComponent),
      },
      {
        path: 'two-factor',
        loadComponent: () => import('./features/auth/two-factor/two-factor').then(m => m.TwoFactorComponent),
      },
      {
        path: 'change-password',
        loadComponent: () => import('./features/auth/change-password/change-password').then(m => m.ChangePasswordComponent),
      },
      {
        path: 'lock-screen',
        loadComponent: () => import('./features/auth/lock-screen/lock-screen').then(m => m.LockScreenComponent),
      },
    ],
  },
  {
    path: '403',
    loadComponent: () =>
      import('./pages/error/access-denied/access-denied').then((m) => m.AccessDeniedComponent),
    title: 'Access Denied - Admin Portal',
  },
  { path: 'access-denied', redirectTo: '403', pathMatch: 'full' },
  {
    path: '404',
    loadComponent: () =>
      import('./pages/error/not-found/not-found').then((m) => m.NotFoundComponent),
    title: 'Page Not Found - Admin Portal',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/error/not-found/not-found').then((m) => m.NotFoundComponent),
    title: 'Page Not Found - Admin Portal',
  },
];

