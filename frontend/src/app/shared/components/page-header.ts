import { Component, input } from '@angular/core';

/**
 * En-tête de page réutilisable.
 * Utilisation : <app-page-header title="Planning" subtitle="Tes séances." />
 */
@Component({
  selector: 'app-page-header',
  template: `
    <header>
      <h1>{{ title() }}</h1>
      @if (subtitle()) {
        <p>{{ subtitle() }}</p>
      }
    </header>
  `,
  styles: `
    h1 { margin: 0; }
    p { color: #6b7280; margin: 0.3rem 0 1.4rem; }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}