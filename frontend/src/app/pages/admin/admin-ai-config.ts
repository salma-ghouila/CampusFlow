import { Component, inject, signal } from '@angular/core';
import { AdminMockService, AiConfig } from '../../core/admin-mock.service';
import { PageHeader } from '../../shared/components/page-header';
import { Skeleton } from '../../shared/components/skeleton';

@Component({
  selector: 'app-admin-ai-config',
  imports: [PageHeader, Skeleton],
  template: `
    <app-page-header
      title="Configuration IA"
      subtitle="Paramètres de génération et d'évaluation."
    />

    @if (loading()) {
      <app-skeleton height="220px" />
    } @else {
      <div class="grid">
        <section class="card" aria-label="Génération de quiz">
          <h2>Génération de quiz</h2>
          <label for="qpq">Questions par quiz</label>
          <input id="qpq" type="number" min="3" max="30" #qpq [value]="config().questionsPerQuiz" />
          <label for="diff">Difficulté par défaut</label>
          <select id="diff" #diff>
            @for (d of difficulties; track d) {
              <option [selected]="d === config().defaultDifficulty">{{ d }}</option>
            }
          </select>
        </section>

        <section class="card" aria-label="Évaluation de la progression">
          <h2>Évaluation de la progression</h2>
          <label for="mt">Seuil de maîtrise (%)</label>
          <input id="mt" type="number" min="0" max="100" #mt [value]="config().masteryThreshold" />
          <label for="wt">Seuil de point faible (%)</label>
          <input id="wt" type="number" min="0" max="100" #wt [value]="config().weakThreshold" />
        </section>
      </div>

      <button type="button" class="save" (click)="save(qpq, diff, mt, wt)">Enregistrer</button>
      @if (saved()) {
        <span class="ok" role="status">✅ Paramètres enregistrés</span>
      }
    }
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .card {
      background: #fff;
      padding: 1.3rem;
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    h2 {
      margin: 0 0 0.4rem;
      font-size: 1.1rem;
    }
    label {
      font-weight: 600;
    }
    input,
    select {
      padding: 0.65rem 0.8rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      font: inherit;
      background: #fff;
    }
    input:focus,
    select:focus,
    button:focus-visible {
      outline: none;
      border-color: #6d28d9;
      box-shadow: 0 0 0 3px #ddd6fe;
    }
    .save {
      padding: 0.7rem 1.3rem;
      border: none;
      border-radius: 10px;
      background: #6d28d9;
      color: #fff;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .save:hover {
      background: #5b21b6;
    }
    .ok {
      margin-left: 0.8rem;
      color: #047857;
    }
  `,
})
export class AdminAiConfig {
  private readonly service = inject(AdminMockService);

  readonly difficulties: AiConfig['defaultDifficulty'][] = ['Facile', 'Adaptative', 'Difficile'];
  readonly config = signal<AiConfig>({
    questionsPerQuiz: 10,
    defaultDifficulty: 'Adaptative',
    masteryThreshold: 75,
    weakThreshold: 50,
  });
  readonly loading = signal(true);
  readonly saved = signal(false);

  constructor() {
    this.service.getConfig().subscribe((c) => {
      this.config.set(c);
      this.loading.set(false);
    });
  }

  save(qpq: HTMLInputElement, diff: HTMLSelectElement, mt: HTMLInputElement, wt: HTMLInputElement) {
    const next: AiConfig = {
      questionsPerQuiz: Number(qpq.value) || 10,
      defaultDifficulty: diff.value as AiConfig['defaultDifficulty'],
      masteryThreshold: Number(mt.value) || 75,
      weakThreshold: Number(wt.value) || 50,
    };
    this.service.saveConfig(next).subscribe((c) => {
      this.config.set(c);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2500);
    });
  }
}
