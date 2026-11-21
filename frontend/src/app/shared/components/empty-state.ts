import { Component, input } from '@angular/core';

/**
 * État vide réutilisable.
 * Utilisation : <app-empty-state icon="📚" title="Aucun groupe" message="Crée-en un." />
 */
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty">
      <div class="ico" aria-hidden="true">{{ icon() }}</div>
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
    </div>
  `,
  styles: `
    .empty { background: #fff; border: 2px dashed #c7d2fe; border-radius: 16px; padding: 3rem 1rem; text-align: center; }
    .ico { font-size: 2.8rem; }
    h3 { margin: 0.5rem 0 0.2rem; }
    p { color: #6b7280; margin: 0; }
  `,
})
export class EmptyState {
  readonly icon = input('📭');
  readonly title = input.required<string>();
  readonly message = input('');
}