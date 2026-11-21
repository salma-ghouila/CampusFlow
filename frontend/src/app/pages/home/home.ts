import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AssistantService } from '../../core/assistant.service';
import { AuthService } from '../../core/auth.service';
import { Exam, PlanningService, Session } from '../../core/planning.service';
import { ProgressService } from '../../core/progress.service';
import { Subject, SubjectsService } from '../../core/subjects.service';
import { PageHeader } from '../../shared/components/page-header';
import { ProgressBar } from '../../shared/components/progress-bar';
import { Skeleton } from '../../shared/components/skeleton';
import { StatCard } from '../../shared/components/stat-card';

interface WeakChapter {
  title: string;
  subject: string;
  mastery: number;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, PageHeader, StatCard, ProgressBar, Skeleton],
  template: `
    <app-page-header
      [title]="'Bonjour ' + (auth.user()?.fullName ?? '') + ' 👋'"
      subtitle="Voici où tu en es dans tes révisions."
    />

    @if (loading()) {
      <app-skeleton height="110px" />
    } @else if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else {
      <div class="stats">
        <app-stat-card label="Progression globale" [value]="globalAverage() + ' %'" />
        <app-stat-card label="Matières" [value]="subjects().length" />
        <app-stat-card
          label="Chapitres maîtrisés (≥ 75 %)"
          [value]="masteredCount() + ' / ' + totalChapters()"
        />
      </div>

      <div class="columns">
        @if (totalChapters() === 0) {
          <section class="panel">
            <h3>Commence par ajouter tes matières 📚</h3>
            <p>Ton tableau de bord se remplira dès que tu auras ajouté des chapitres.</p>
            <a routerLink="/subjects" class="link">Ajouter ma première matière →</a>
          </section>
        } @else {
          <section class="panel" aria-label="Progression par matière">
            <h3>Progression par matière</h3>
            @for (s of subjects(); track s.id) {
              <div class="line">
                <div class="line-head">
                  <span>{{ s.name }}</span>
                  <b>{{ subjectAverage(s) }} %</b>
                </div>
                <app-progress-bar
                  size="small"
                  [value]="subjectAverage(s)"
                  [label]="'Progression ' + s.name"
                />
              </div>
            }
          </section>

          <section class="panel" aria-label="Chapitres à réviser">
            <h3>Chapitres à réviser en priorité</h3>
            @for (c of weakChapters(); track c.title + c.subject) {
              <div class="weak">
                <div>
                  <strong>{{ c.title }}</strong>
                  <small>{{ c.subject }}</small>
                </div>
                <span class="badge">{{ c.mastery }} %</span>
              </div>
            }
            <a routerLink="/subjects" class="link">Mettre à jour ma progression →</a>
          </section>
        }

        <section class="panel" aria-label="Séances du jour">
          <h3>Séances d'étude du jour</h3>
          @for (s of todaySessions(); track s.id) {
            <div class="row">
              <span class="time">{{ s.time }}</span>
              <div>
                <strong>{{ s.ai ? '✦ ' : '' }}{{ s.title }}</strong>
                <small>{{ s.subject }}</small>
              </div>
            </div>
          } @empty {
            <p class="none">Aucune séance prévue aujourd'hui.</p>
          }
          <a routerLink="/planning" class="link">Ouvrir le planning →</a>
        </section>

        <section class="panel" aria-label="Examens à venir">
          <h3>Examens à venir</h3>
          @for (e of exams(); track e.id) {
            <div class="row">
              <span class="time">{{ e.date }}</span>
              <div>
                <strong>{{ e.subject }}</strong>
                <small>{{ e.room }}</small>
              </div>
            </div>
          } @empty {
            <p class="none">Aucun examen prévu.</p>
          }
        </section>

        <section class="panel ai" aria-label="Recommandations IA">
          <h3>✦ Recommandations IA</h3>
          @for (r of recommendations; track r.title) {
            <div class="row">
              <span class="time light">{{ r.tag }}</span>
              <div>
                <strong>{{ r.title }}</strong>
                <small>{{ r.hint }}</small>
              </div>
            </div>
          }
          <a routerLink="/quiz" class="ai-btn">Lancer un quiz</a>
        </section>

        <section class="panel" aria-label="Accès rapide">
          <h3>Accès rapide</h3>
          <div class="quick">
            <a routerLink="/planning">+ Ajouter une séance</a>
            <a routerLink="/library">Partager une ressource</a>
            <a routerLink="/groups">Rejoindre un groupe</a>
            <a routerLink="/assistant">Poser une question à l'IA</a>
          </div>
        </section>
      </div>
    }
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem; align-items: start; }
    .panel { background: #fff; padding: 1.2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
    .panel h3 { margin-top: 0; }
    .line { margin-bottom: 0.9rem; }
    .line-head { display: flex; justify-content: space-between; margin-bottom: 0.3rem; font-size: 0.95rem; }
    .weak { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; }
    .weak small, .row small { display: block; color: #6b7280; }
    .badge { background: #fee2e2; color: #b91c1c; padding: 0.15rem 0.6rem; border-radius: 999px; font-weight: 600; font-size: 0.85rem; }
    .row { display: flex; gap: 0.7rem; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; }
    .time { background: #eef2ff; color: #4f46e5; font-weight: 700; padding: 0.25rem 0.55rem; border-radius: 8px; font-size: 0.8rem; white-space: nowrap; }
    .time.light { background: rgba(255,255,255,0.2); color: #fff; }
    .none { color: #9ca3af; margin: 0; }
    .ai { background: linear-gradient(135deg, #4f46e5, #8b5cf6); color: #fff; }
    .ai .row { border-color: rgba(255,255,255,0.2); }
    .ai small { color: #e0e7ff; }
    .ai-btn { display: inline-block; margin-top: 1rem; background: #fff; color: #4f46e5; padding: 0.5rem 1rem; border-radius: 999px; font-weight: 700; text-decoration: none; }
    .quick { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .quick a { border: 1.5px solid #e5e7eb; border-radius: 999px; padding: 0.4rem 0.9rem; color: #374151; text-decoration: none; font-size: 0.9rem; }
    .quick a:hover { border-color: #a5b4fc; background: #eef2ff; }
    .link { display: inline-block; margin-top: 1rem; color: #4f46e5; text-decoration: none; font-weight: 600; }
    a:focus-visible { outline: none; box-shadow: 0 0 0 3px #c7d2fe; border-radius: 6px; }
    .error { color: #dc2626; }
  `,
})
export class Home {
  readonly auth = inject(AuthService);
  private readonly subjectsService = inject(SubjectsService);
  private readonly progressService = inject(ProgressService);
  private readonly planningService = inject(PlanningService);
  private readonly assistantService = inject(AssistantService);

  readonly subjects = signal<Subject[]>([]);
  readonly mastery = signal<Record<string, number>>({});
  readonly sessions = signal<Session[]>([]);
  readonly exams = signal<Exam[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly recommendations = this.assistantService.recommendations;

  readonly totalChapters = computed(() => this.subjects().flatMap((s) => s.chapters).length);

  readonly globalAverage = computed(() => {
    const chapters = this.subjects().flatMap((s) => s.chapters);
    if (!chapters.length) return 0;
    const m = this.mastery();
    return Math.round(chapters.reduce((sum, c) => sum + (m[c.id] ?? 0), 0) / chapters.length);
  });

  readonly masteredCount = computed(() => {
    const m = this.mastery();
    return this.subjects()
      .flatMap((s) => s.chapters)
      .filter((c) => (m[c.id] ?? 0) >= 75).length;
  });

  readonly weakChapters = computed<WeakChapter[]>(() => {
    const m = this.mastery();
    return this.subjects()
      .flatMap((s) =>
        s.chapters.map((c) => ({ title: c.title, subject: s.name, mastery: m[c.id] ?? 0 })),
      )
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 4);
  });

  /** Séances du jour courant (0 = lundi ... 6 = dimanche), triées par heure. */
  readonly todaySessions = computed(() => {
    const today = (new Date().getDay() + 6) % 7;
    return this.sessions()
      .filter((s) => s.day === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  });

  constructor() {
    forkJoin({
      subjects: this.subjectsService.getAll(),
      progress: this.progressService.getMine(),
      sessions: this.planningService.getSessions(),
      exams: this.planningService.getExams(),
    }).subscribe({
      next: ({ subjects, progress, sessions, exams }) => {
        this.subjects.set(subjects);
        this.mastery.set(Object.fromEntries(progress.map((p) => [p.chapterId, p.mastery])));
        this.sessions.set(sessions);
        this.exams.set(exams);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le tableau de bord');
        this.loading.set(false);
      },
    });
  }

  subjectAverage(subject: Subject): number {
    if (!subject.chapters.length) return 0;
    const m = this.mastery();
    return Math.round(
      subject.chapters.reduce((sum, c) => sum + (m[c.id] ?? 0), 0) / subject.chapters.length,
    );
  }
}