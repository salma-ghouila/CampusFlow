import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * En-tête commun aux pages publiques (FAQ, Contact, pages légales).
 * Utilisation : <app-public-header />
 */
@Component({
  selector: 'app-public-header',
  imports: [RouterLink],
  template: `
    <header class="bar">
      <a routerLink="/" class="logo">🎓 CampusFlow</a>
      <nav aria-label="Navigation publique">
        <a routerLink="/faq">FAQ</a>
        <a routerLink="/contact">Contact</a>
        <a routerLink="/privacy">Confidentialité</a>
        <a routerLink="/terms">Conditions</a>
        <a routerLink="/login" class="btn">Connexion</a>
      </nav>
    </header>
  `,
  styles: `
    .bar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,0.06); flex-wrap: wrap; gap: 0.6rem; }
    .logo { font-weight: 700; font-size: 1.15rem; color: #1e1b4b; text-decoration: none; }
    nav { display: flex; gap: 1.2rem; align-items: center; }
    nav a { color: #4b5563; text-decoration: none; }
    nav a:hover { color: #4f46e5; }
    .btn { background: #4f46e5; color: #fff; padding: 0.5rem 1rem; border-radius: 10px; font-weight: 600; }
    .btn:hover { background: #4338ca; color: #fff; }
    a:focus-visible { outline: none; box-shadow: 0 0 0 3px #c7d2fe; border-radius: 6px; }
  `,
})
export class PublicHeader {}