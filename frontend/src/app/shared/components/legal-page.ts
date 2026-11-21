import { Component, input } from '@angular/core';
import { PageHeader } from './page-header';
import { PublicHeader } from './public-header';

export interface LegalSection {
  title: string;
  text: string;
}

/**
 * Modèle de page légale réutilisable.
 * Utilisation : <app-legal-page title="..." subtitle="..." [sections]="sections" />
 */
@Component({
  selector: 'app-legal-page',
  imports: [PublicHeader, PageHeader],
  template: `
    <app-public-header />
    <main class="wrap">
      <app-page-header [title]="title()" [subtitle]="subtitle()" />
      @for (s of sections(); track s.title) {
        <section class="block">
          <h2>{{ s.title }}</h2>
          <p>{{ s.text }}</p>
        </section>
      }
    </main>
  `,
  styles: `
    .wrap {
      max-width: 760px;
      margin: 0 auto;
      padding: 2rem 1.2rem 3rem;
    }
    .block {
      background: #fff;
      padding: 1.2rem 1.4rem;
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      margin-bottom: 0.8rem;
    }
    h2 {
      margin: 0 0 0.4rem;
      font-size: 1.1rem;
      color: #1e1b4b;
    }
    p {
      margin: 0;
      color: #4b5563;
      line-height: 1.6;
    }
  `,
})
export class LegalPage {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly sections = input.required<LegalSection[]>();
}
