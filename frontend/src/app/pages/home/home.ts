import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { ProgressService } from '../../core/progress.service';
import { Subject, SubjectsService } from '../../core/subjects.service';

interface WeakChapter {
  title: string;
  subject: string;
  mastery: number;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <header class="head">
      <h1>Bonjour {{ auth.user()?.fullName }} 👋</h1>
      <p>Voici où tu en es dans tes révisions.</p>
    </header>

    @if (loading()) {
      <p>Chargement...</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (totalChapters() === 0) {
      <div class="panel">
        <h3>Commence par ajouter tes matières 📚</h3>
        <p>
          Ton tableau de bord se remplira dès que tu auras ajouté des matières et des
          chapitres.
        </p>
        <a routerLink="/subjects" class="link">Ajouter ma première matière →</a>
      </div>
    } @else {
      <div class="stats">
        <div class="stat">
          <span>Progression globale</span>
          <strong>{{ globalAverage() }} %</strong>
        </div>
        <div class="stat">
          <span>Matières</span>
          <strong>{{ subjects().length }}</strong>
        </div>
        <div class="stat">
          <span>Chapitres maîtrisés (≥ 75 %)</span>
          <strong>{{ masteredCount() }} / {{ totalChapters() }}</strong>
        </div>
      </div>

      <div class="columns">
        <section class="panel">
          <h3>Progression par matière</h3>
          @for (s of subjects(); track s.id) {
            <div class="line">
              <div class="line-head">
                <span>{{ s.name }}</span>
                <b>{{ subjectAverage(s) }} %</b>
              </div>
              <div class="bar"><div class="fill" [style.width.%]="subjectAverage(s)"></div></div>
            </div>
          }
        </section>

        <section class="panel">
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
      </div>
    }
  `,
  styles: `
    .head h1 { margin: 0; }
    .head p { color: #6b7280; margin: 0.3rem 0 1.5rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat { background: #fff; padding: 1.2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 0.4rem; }
    .stat span { color: #6b7280; font-size: 0.9rem; }
    .stat strong { font-size: 1.8rem; color: #4f46e5; }
    .columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem; }
    .panel { background: #fff; padding: 1.2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
    .panel h3 { margin-top: 0; }
    .line { margin-bottom: 0.9rem; }
    .line-head { display: flex; justify-content: space-between; margin-bottom: 0.3rem; font-size: 0.95rem; }
    .bar { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
    .fill { height: 100%; background: #4f46e5; transition: width 0.3s; }
    .weak { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; }
    .weak small { display: block; color: #6b7280; }
    .badge { background: #fee2e2; color: #b91c1c; padding: 0.15rem 0.6rem; border-radius: 999px; font-weight: 600; font-size: 0.85rem; }
    .link { display: inline-block; margin-top: 1rem; color: #4f46e5; text-decoration: none; font-weight: 600; }
    .error { color: #dc2626; }
  `,
})
export class Home {
  readonly auth = inject(AuthService);
  private readonly subjectsService = inject(SubjectsService);
  private readonly progressService = inject(ProgressService);

  readonly subjects = signal<Subject[]>([]);
  readonly mastery = signal<Record<string, number>>({});
  readonly loading = signal(true);
  readonly error = signal('');

  readonly totalChapters = computed(
    () => this.subjects().flatMap((s) => s.chapters).length,
  );

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