import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <main class="wrap">
      <h1>404</h1>
      <p>Oups, cette page est introuvable.</p>
      <a routerLink="/" class="btn">Retour à l'accueil</a>
    </main>
  `,
  styles: `
    .wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem; text-align: center; background: radial-gradient(circle at top, #e0e7ff, #f8fafc 60%); }
    h1 { margin: 0; font-size: 5rem; color: #0f172a; }
    p { color: #6b7280; margin: 0 0 1rem; }
    .btn { padding: 0.7rem 1.3rem; border-radius: 10px; background: #4f46e5; color: #fff; text-decoration: none; font-weight: 600; transition: background 0.15s; }
    .btn:hover { background: #4338ca; }
    .btn:focus-visible { outline: none; box-shadow: 0 0 0 3px #c7d2fe; }
  `,
})
export class NotFound {}