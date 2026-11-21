import { Component, signal } from '@angular/core';
import { PageHeader } from '../../shared/components/page-header';
import { PublicHeader } from '../../shared/components/public-header';

@Component({
  selector: 'app-faq',
  imports: [PublicHeader, PageHeader],
  template: `
    <app-public-header />
    <main class="wrap">
      <app-page-header
        title="Questions fréquentes"
        subtitle="Les réponses aux questions les plus courantes."
      />

      <div class="list">
        @for (item of items; track item.q; let i = $index) {
          <section class="item">
            <h2>
              <button
                type="button"
                [attr.aria-expanded]="open() === i"
                [attr.aria-controls]="'faq-' + i"
                (click)="toggle(i)"
              >
                <span>{{ item.q }}</span>
                <span class="chevron" aria-hidden="true">{{ open() === i ? '−' : '+' }}</span>
              </button>
            </h2>
            @if (open() === i) {
              <p [id]="'faq-' + i" class="answer">{{ item.a }}</p>
            }
          </section>
        }
      </div>
    </main>
  `,
  styles: `
    .wrap {
      max-width: 760px;
      margin: 0 auto;
      padding: 2rem 1.2rem 3rem;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }
    .item {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    }
    h2 {
      margin: 0;
      font-size: 1rem;
    }
    button {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.2rem;
      border: none;
      background: none;
      font: inherit;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      border-radius: 14px;
    }
    button:hover {
      background: #f5f3ff;
    }
    button:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px #c7d2fe;
    }
    .chevron {
      color: #4f46e5;
      font-size: 1.3rem;
    }
    .answer {
      margin: 0;
      padding: 0 1.2rem 1.1rem;
      color: #4b5563;
      line-height: 1.5;
      animation: fade 0.2s ease-out;
    }
    @keyframes fade {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  `,
})
export class Faq {
  readonly open = signal<number | null>(0);

  readonly items = [
    {
      q: "Qu'est-ce que CampusFlow ?",
      a: "CampusFlow est une plateforme web qui regroupe l'organisation de tes études : matières, ressources partagées, groupes d'étude, planning, progression et assistant IA.",
    },
    {
      q: "Comment m'inscrire ?",
      a: "Clique sur « S'inscrire », renseigne ton nom, ton e-mail et un mot de passe d'au moins 8 caractères. Ton compte étudiant est créé immédiatement.",
    },
    {
      q: 'Les ressources sont-elles vérifiées ?',
      a: 'Les ressources déposées par les étudiants sont examinées par les administrateurs, qui peuvent les approuver, les rejeter ou traiter les contenus signalés.',
    },
    {
      q: "Comment fonctionne l'assistant IA ?",
      a: "Il analyse ta progression pour repérer tes points faibles, génère des quiz personnalisés et te propose des recommandations et un plan d'étude.",
    },
    {
      q: 'Mes données sont-elles protégées ?',
      a: "Tes mots de passe sont chiffrés et l'accès aux pages est protégé par une authentification. Consulte la politique de confidentialité pour plus de détails.",
    },
  ];

  toggle(i: number) {
    this.open.update((current) => (current === i ? null : i));
  }
}
