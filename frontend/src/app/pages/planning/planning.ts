import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Exam, PlanningService, Session } from '../../core/planning.service';
import { PageHeader } from '../../shared/components/page-header';
import { Skeleton } from '../../shared/components/skeleton';

@Component({
  selector: 'app-planning',
  imports: [PageHeader, Skeleton],
  template: `
    <app-page-header
     title="Planning d'étude"
     subtitle="Tes séances manuelles et celles générées par l'assistant IA."
    />

    <section class="add" aria-label="Ajouter une séance">
      <input
        #title
        placeholder="Titre de la séance"
        aria-label="Titre de la séance"
        (keyup.enter)="add(title, subject, day, time)"
      />
      <select #subject aria-label="Matière">
        @for (s of subjectsList; track s) {
          <option [value]="s">{{ s }}</option>
        }
      </select>
      <select #day aria-label="Jour">
        @for (d of days; track $index) {
          <option [value]="$index">{{ d }}</option>
        }
      </select>
      <input #time type="time" value="09:00" aria-label="Heure" />
      <button type="button" (click)="add(title, subject, day, time)">+ Nouvelle séance</button>
    </section>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }

    @if (loading()) {
      <div class="week" aria-busy="true" aria-label="Chargement">
        @for (i of [1, 2, 3, 4, 5, 6, 7]; track i) {
          <app-skeleton height="160px" />
        }
      </div>
    } @else {
      <div class="layout">
        <section class="week" aria-label="Semaine">
          @for (d of days; track $index) {
            <div class="col">
              <h3>{{ d }}</h3>
              @for (s of sessionsOf($index); track s.id) {
                <div class="session" [class.ai]="s.ai" [class.done]="s.done">
                  <span class="time">{{ s.time }}</span>
                  <strong>{{ s.ai ? '✦ ' : '' }}{{ s.title }}</strong>
                  <small>{{ s.subject }}</small>
                  <div class="row">
                    <button
                      type="button"
                      class="mini"
                      (click)="toggleDone(s)"
                      [attr.aria-label]="s.done ? 'Marquer non terminée' : 'Marquer terminée'"
                    >
                      {{ s.done ? '↩' : '✓' }}
                    </button>
                    <button
                      type="button"
                      class="mini danger"
                      (click)="remove(s)"
                      aria-label="Supprimer la séance"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              } @empty {
                <p class="none">—</p>
              }
            </div>
          }
        </section>

        <aside class="exams" aria-label="Examens à venir">
          <h2>Examens à venir</h2>
          @for (e of exams(); track e.id) {
            <div class="exam">
              <span class="date">{{ e.date }}</span>
              <div>
                <strong>{{ e.subject }}</strong>
                <small>{{ e.room }}</small>
              </div>
            </div>
          } @empty {
            <p class="none">Aucun examen prévu.</p>
          }
        </aside>
      </div>

      <p class="legend">
        ✦ = séance générée par l'assistant IA · {{ doneCount() }}/{{ sessions().length }} séances
        terminées
      </p>
    }
  `,
  styles: `
    
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
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px #e0e7ff;
    }
    .add {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-bottom: 1.2rem;
    }
    .add input:first-child {
      flex: 1;
      min-width: 180px;
    }
    .add button {
      padding: 0.65rem 1.1rem;
      border: none;
      border-radius: 10px;
      background: #4f46e5;
      color: #fff;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .add button:hover {
      background: #4338ca;
    }
    .layout {
      display: grid;
      grid-template-columns: 1fr 260px;
      gap: 1rem;
      align-items: start;
    }
    .week {
      display: grid;
      grid-template-columns: repeat(7, minmax(110px, 1fr));
      gap: 0.5rem;
      overflow-x: auto;
    }
    .col {
      background: #fff;
      border-radius: 12px;
      padding: 0.6rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      min-height: 140px;
    }
    .col h3 {
      margin: 0 0 0.5rem;
      font-size: 0.85rem;
      color: #4f46e5;
    }
    .session {
      background: #eef2ff;
      border-left: 4px solid #4f46e5;
      border-radius: 8px;
      padding: 0.45rem;
      margin-bottom: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      font-size: 0.82rem;
      transition: transform 0.15s;
    }
    .session:hover {
      transform: translateY(-1px);
    }
    .session.ai {
      background: #f5f3ff;
      border-left-color: #8b5cf6;
    }
    .session.done {
      opacity: 0.55;
      text-decoration: line-through;
    }
    .time {
      font-weight: 700;
      color: #4f46e5;
    }
    small {
      color: #6b7280;
    }
    .row {
      display: flex;
      gap: 0.3rem;
      margin-top: 0.2rem;
    }
    .mini {
      border: 1px solid #e5e7eb;
      background: #fff;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.75rem;
      padding: 0.1rem 0.4rem;
    }
    .mini.danger:hover {
      background: #fee2e2;
    }
    .none {
      color: #9ca3af;
      font-size: 0.85rem;
      margin: 0;
    }
    .exams {
      background: #fff;
      border-radius: 14px;
      padding: 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    }
    .exams h2 {
      margin: 0 0 0.8rem;
      font-size: 1.05rem;
    }
    .exam {
      display: flex;
      gap: 0.7rem;
      align-items: center;
      padding: 0.5rem 0;
      border-top: 1px solid #f3f4f6;
    }
    .exam div {
      display: flex;
      flex-direction: column;
    }
    .date {
      background: #eef2ff;
      color: #4f46e5;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      font-size: 0.8rem;
      white-space: nowrap;
    }
    .legend {
      color: #6b7280;
      font-size: 0.9rem;
      margin-top: 1rem;
    }
    
    .error {
      color: #dc2626;
    }
    @media (max-width: 900px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class Planning {
  private readonly service = inject(PlanningService);

  readonly days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  readonly subjectsList = [
    'Algorithmique',
    'Bases de données',
    'Réseaux',
    'Mathématiques',
    'Anglais technique',
  ];

  readonly sessions = signal<Session[]>([]);
  readonly exams = signal<Exam[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly doneCount = computed(() => this.sessions().filter((s) => s.done).length);

  constructor() {
    forkJoin({
      sessions: this.service.getSessions(),
      exams: this.service.getExams(),
    }).subscribe({
      next: ({ sessions, exams }) => {
        this.sessions.set(sessions);
        this.exams.set(exams);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le planning');
        this.loading.set(false);
      },
    });
  }

  /** Séances d'un jour donné, triées par heure. */
  sessionsOf(day: number): Session[] {
    return this.sessions()
      .filter((s) => s.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  add(
    title: HTMLInputElement,
    subject: HTMLSelectElement,
    day: HTMLSelectElement,
    time: HTMLInputElement,
  ) {
    const value = title.value.trim();
    if (value.length < 2) return;
    this.service
      .addSession(value, subject.value, Number(day.value), time.value || '09:00')
      .subscribe((s) => {
        this.sessions.update((list) => [...list, s]);
        title.value = '';
      });
  }

  toggleDone(s: Session) {
    this.service
      .toggleDone(s.id)
      .subscribe((u) => this.sessions.update((list) => list.map((x) => (x.id === u.id ? u : x))));
  }

  remove(s: Session) {
    this.service
      .removeSession(s.id)
      .subscribe(() => this.sessions.update((list) => list.filter((x) => x.id !== s.id)));
  }
}
