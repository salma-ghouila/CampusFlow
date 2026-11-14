import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { Shell } from './layout/shell';
import { Home } from './pages/home/home';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { Register } from './pages/register/register';
import { Subjects } from './pages/subjects/subjects';

export const routes: Routes = [
  { path: '', component: Landing, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Home },
      { path: 'subjects', component: Subjects },
      { path: 'profile', component: Profile },
    ],
  },
  { path: '**', redirectTo: '' },
];