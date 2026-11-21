import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * Conteneur de l'espace admin : sous-menu + page affichée en dessous.
 */
@Component({
  selector: 'app-admin-area',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="tabs" aria-label="Espace administrateur">
      <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
        >Tableau de bord</a
      >
      <a routerLink="/admin/users" routerLinkActive="active">Utilisateurs</a>
      <a routerLink="/admin/moderation" routerLinkActive="active">Modération</a>
      <a routerLink="/admin/ai-config" routerLinkActive="active">Configuration IA</a>
    </nav>
    <router-outlet />
  `,
  styles: `
    .tabs {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    a {
      padding: 0.5rem 1rem;
      border-radius: 999px;
      border: 1.5px solid #e5e7eb;
      background: #fff;
      color: #374151;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover {
      border-color: #a78bfa;
    }
    a.active {
      background: #6d28d9;
      color: #fff;
      border-color: transparent;
    }
    a:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px #ddd6fe;
    }
  `,
})
export class AdminArea {}
