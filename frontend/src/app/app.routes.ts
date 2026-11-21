import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth.guard';
import { Shell } from './layout/shell';

/**
 * Routes de l'application.
 * Les pages sont chargées à la demande (lazy loading) avec loadComponent :
 * le navigateur ne télécharge une page que lorsqu'on la visite.
 */
export const routes: Routes = [
  // Zone publique
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  { path: 'faq', loadComponent: () => import('./pages/faq/faq').then((m) => m.Faq) },
 
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact) },
 
  { path: 'privacy', loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy) },
 
  { path: 'terms', loadComponent: () => import('./pages/terms/terms').then((m) => m.Terms) },

  // Zone étudiant (connexion obligatoire)
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
      {
        path: 'subjects',
        loadComponent: () => import('./pages/subjects/subjects').then((m) => m.Subjects),
      },
      {
        path: 'library',
        loadComponent: () => import('./pages/library/library').then((m) => m.Library),
      },
      {
        path: 'planning',
        loadComponent: () => import('./pages/planning/planning').then((m) => m.Planning),
      },
      {
        path: 'groups',
        loadComponent: () => import('./pages/groups/groups').then((m) => m.Groups),
      },
      {
        path: 'progress',
        loadComponent: () => import('./pages/progress/progress').then((m) => m.Progress),
      },
      {
        path: 'assistant',
        loadComponent: () => import('./pages/assistant/assistant').then((m) => m.Assistant),
      },
      { path: 'quiz', loadComponent: () => import('./pages/quiz/quiz').then((m) => m.Quiz) },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
      },
    ],
  },

  // Page introuvable
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
