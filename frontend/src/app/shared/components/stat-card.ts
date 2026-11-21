import { Component, input } from '@angular/core';

/**
 * Carte de statistique réutilisable.
 * Utilisation : <app-stat-card label="Progression globale" value="68 %" />
 */
@Component({
  selector: 'app-stat-card',
  template: `
    <div class="stat">
      <small>{{ label() }}</small>
      <strong>{{ value() }}</strong>
    </div>
  `,
  styles: `
    .stat { background: #fff; padding: 1.1rem 1.2rem; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 0.2rem; }
    small { color: #6b7280; }
    strong { font-size: 1.7rem; color: #4f46e5; }
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
}