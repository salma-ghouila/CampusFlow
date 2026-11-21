import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProgressService } from '../../core/progress.service';
import { Subject, SubjectsService } from '../../core/subjects.service';
import { ProgressBar } from '../../shared/components/progress-bar';
import { EmptyState } from '../../shared/components/empty-state';
import { PageHeader } from '../../shared/components/page-header';
import { Skeleton } from '../../shared/components/skeleton';
import { StatCard } from '../../shared/components/stat-card';

interface Level {
  label: string;
  tone: 'low' | 'mid' | 'high';
}

@Component({
  selector: 'app-progress',
 
  imports: [ProgressBar, PageHeader, Skeleton, EmptyState, StatCard],
  template: `
    <app-page-header
     title="Progression académique"
     subtitle="Ta maîtrise par matière et par chapitre."
    />
    @if (loading()) {
      <div class="stats" aria-busy="true" aria-label="Chargement">
        @for (i of [1, 2, 3]; track i) {
          <app-skeleton height="90px" />
        }
      </div>
    } @else if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (subjects().length === 0) {
      <app-empty-state
       icon="📈"
       title="Pas encore de progression"
       message="Ajoute des matières et des chapitres dans « Matières » pour suivre ta maîtrise."
      />
    } @else {
      <section class="stats">
       <app-stat-card label="Progression globale" [value]="globalAverage() + ' %'" />
       <app-stat-card label="Chapitres maîtrisés" [value]="masteredCount() + ' / ' + totalChapters()" />
       <app-stat-card label="Matières suivies" [value]="subjects().length" />
      </section>

      <div class="layout">
        <section class="panel" aria-label="Progression par matière">
          <h2>Par matière</h2>
          @for (s of subjects(); track s.id) {
            <div class="line">
              <div class="line-head">
                <span>{{ s.name }}</span>
                <strong>{{ subjectAverage(s) }} %</strong>
              </div>
              <app-progress-bar [value]="subjectAverage(s)" [label]="'Progression ' + s.name" />
            </div>
          }
        </section>

        <section class="panel" aria-label="Niveaux de maîtrise">
          <h2>Niveaux de maîtrise</h2>
          @for (s of subjects(); track s.id) {
            @for (c of s.chapters; track c.id) {
              <div class="chapter">
                <span class="tag" [class]="level(c.id).tone">{{ level(c.id).label }}</span>
                <div>
                  <strong>{{ c.title }}</strong>
                  <small>{{ s.name }}</small>
                </div>
              </div>
            }
          }
        </section>
      </div>
    }
  `,
  styles: `
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .layout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      align-items: start;
    }
    .panel {
      background: #fff;
      padding: 1.2rem;
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    }
    .panel h2 {
      margin: 0 0 1rem;
      font-size: 1.1rem;
    }
    .line {
      margin-bottom: 1rem;
    }
    .line-head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }
    .chapter {
      display: flex;
      gap: 0.7rem;
      align-items: center;
      padding: 0.55rem 0;
      border-top: 1px solid #f3f4f6;
    }
    .chapter div {
      display: flex;
      flex-direction: column;
    }
    .chapter small {
      color: #6b7280;
    }
    .tag {
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .tag.low {
      background: #fee2e2;
      color: #b91c1c;
    }
    .tag.mid {
      background: #fef3c7;
      color: #b45309;
    }
    .tag.high {
      background: #d1fae5;
      color: #047857;
    }
    
    .error {
      color: #dc2626;
    }
  `,
})
export class Progress {
  private readonly subjectsService = inject(SubjectsService);
  private readonly progressService = inject(ProgressService);

  readonly subjects = signal<Subject[]>([]);
  readonly mastery = signal<Record<string, number>>({});
  readonly loading = signal(true);
  readonly error = signal('');

  readonly totalChapters = computed(() =>
    this.subjects().reduce((sum, s) => sum + s.chapters.length, 0),
  );

  readonly masteredCount = computed(
    () =>
      this.subjects()
        .flatMap((s) => s.chapters)
        .filter((c) => (this.mastery()[c.id] ?? 0) >= 75).length,
  );

  readonly globalAverage = computed(() => {
    const chapters = this.subjects().flatMap((s) => s.chapters);
    if (!chapters.length) return 0;
    const m = this.mastery();
    return Math.round(chapters.reduce((sum, c) => sum + (m[c.id] ?? 0), 0) / chapters.length);
  });

  constructor() {
    forkJoin({
      subjects: this.subjectsService.getAll(),
      progress: this.progressService.getMine(),
    }).subscribe({
      next: ({ subjects, progress }) => {
        this.subjects.set(subjects);
        this.mastery.set(Object.fromEntries(progress.map((p) => [p.chapterId, p.mastery])));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger la progression');
        this.loading.set(false);
      },
    });
  }

  subjectAverage(subject: Subject): number {
    if (!subject.chapters.length) return 0;
    const total = subject.chapters.reduce((sum, c) => sum + (this.mastery()[c.id] ?? 0), 0);
    return Math.round(total / subject.chapters.length);
  }

  /** Transforme une valeur 0-100 en niveau lisible. */
  level(chapterId: string): Level {
    const v = this.mastery()[chapterId] ?? 0;
    if (v >= 75) return { label: 'Fort', tone: 'high' };
    if (v >= 50) return { label: 'Moyen', tone: 'mid' };
    return { label: 'Faible', tone: 'low' };
  }
}
