import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProgressService } from '../../core/progress.service';
import { Subject, SubjectsService } from '../../core/subjects.service';

@Component({
  selector: 'app-subjects',
  template: `
    <header class="head">
      <div>
        <h1>Mes matières</h1>
        <p>Ajoute tes matières et leurs chapitres, puis indique ton niveau pour chacun.</p>
      </div>
    </header>

    @if (loading()) {
      <p>Chargement...</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else {
      <section class="add-subject">
        <input #newSubject placeholder="Nouvelle matière (ex : Réseaux informatiques)"
               (keyup.enter)="addSubject(newSubject)" />
        <button (click)="addSubject(newSubject)">+ Ajouter la matière</button>
      </section>

      @if (actionError()) {
        <p class="error">{{ actionError() }}</p>
      }

      @if (subjects().length === 0) {
        <div class="empty">
          <div class="empty-ico">📚</div>
          <h3>Aucune matière pour le moment</h3>
          <p>Commence par ajouter ta première matière ci-dessus.</p>
        </div>
      } @else {
        <section class="global">
          <div class="global-head">
            <strong>Progression globale</strong>
            <span>{{ globalAverage() }} %</span>
          </div>
          <div class="bar"><div class="fill" [style.width.%]="globalAverage()"></div></div>
        </section>

        <div class="grid">
          @for (subject of subjects(); track subject.id) {
            <section class="card">
              <div class="card-head">
                <h3>{{ subject.name }}</h3>
                <div class="head-actions">
                  <span class="avg">{{ subjectAverage(subject) }} %</span>
                  <button class="icon-btn" title="Supprimer la matière" (click)="removeSubject(subject)">🗑️</button>
                </div>
              </div>
              <div class="bar small"><div class="fill" [style.width.%]="subjectAverage(subject)"></div></div>

              <ul>
                @for (chapter of subject.chapters; track chapter.id) {
                  <li>
                    <div class="row">
                      <span class="title">{{ chapter.order }}. {{ chapter.title }}</span>
                      <button class="icon-btn small" title="Supprimer le chapitre"
                              (click)="removeChapter(subject, chapter.id)">✕</button>
                    </div>
                    <div class="levels">
                      @for (l of levels; track l.value) {
                        <button type="button" class="chip" [attr.data-v]="l.value"
                                [class.active]="current(chapter.id) === l.value"
                                (click)="setLevel(chapter.id, l.value)">
                          {{ l.label }}
                        </button>
                      }
                    </div>
                  </li>
                } @empty {
                  <li class="no-chapter">Aucun chapitre. Ajoute-en un ci-dessous.</li>
                }
              </ul>

              <div class="add-chapter">
                <input #newChapter placeholder="Nouveau chapitre" (keyup.enter)="addChapter(subject, newChapter)" />
                <button (click)="addChapter(subject, newChapter)">Ajouter</button>
              </div>
            </section>
          }
        </div>
      }
    }
  `,
  styles: `
    .head h1 { margin: 0; }
    .head p { color: #6b7280; margin: 0.3rem 0 1.4rem; }
    .add-subject { display: flex; gap: 0.6rem; margin-bottom: 1.2rem; }
    .add-subject input { flex: 1; }
    input { padding: 0.7rem 0.9rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font: inherit; background: #fff; }
    input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px #e0e7ff; }
    .add-subject button, .add-chapter button {
      padding: 0.7rem 1.1rem; border: none; border-radius: 10px; background: #4f46e5; color: #fff;
      font: inherit; font-weight: 600; cursor: pointer; white-space: nowrap;
    }
    .add-subject button:hover, .add-chapter button:hover { background: #4338ca; }

    .empty { background: #fff; border: 2px dashed #c7d2fe; border-radius: 16px; padding: 3rem 1rem; text-align: center; }
    .empty-ico { font-size: 2.8rem; }
    .empty h3 { margin: 0.5rem 0 0.2rem; }
    .empty p { color: #6b7280; margin: 0; }

    .global { background: #fff; padding: 1.2rem; border-radius: 14px; margin-bottom: 1.2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
    .global-head { display: flex; justify-content: space-between; margin-bottom: 0.6rem; }
    .bar { height: 10px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
    .bar.small { height: 6px; margin: 0.6rem 0 0.4rem; }
    .fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #818cf8); transition: width 0.3s; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; align-items: start; }
    .card { background: #fff; padding: 1.2rem; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
    .card-head { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
    .card h3 { margin: 0; }
    .head-actions { display: flex; align-items: center; gap: 0.4rem; }
    .avg { background: #eef2ff; color: #4f46e5; padding: 0.15rem 0.65rem; border-radius: 999px; font-weight: 700; font-size: 0.85rem; }
    .icon-btn { border: none; background: none; cursor: pointer; font-size: 1rem; padding: 0.3rem; border-radius: 8px; opacity: 0.7; }
    .icon-btn:hover { background: #fee2e2; opacity: 1; }
    .icon-btn.small { font-size: 0.8rem; color: #9ca3af; }

    ul { list-style: none; padding: 0; margin: 0.8rem 0 0; display: flex; flex-direction: column; gap: 1rem; }
    .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
    .title { font-size: 0.95rem; font-weight: 500; }
    .no-chapter { color: #9ca3af; font-size: 0.9rem; }

    .levels { display: flex; gap: 0.35rem; flex-wrap: wrap; }
    .chip { border: 1.5px solid #e5e7eb; background: #f9fafb; color: #4b5563; padding: 0.3rem 0.7rem;
      border-radius: 999px; font: inherit; font-size: 0.8rem; cursor: pointer; transition: all 0.12s; }
    .chip:hover { border-color: #a5b4fc; background: #eef2ff; }
    .chip.active { color: #fff; font-weight: 600; border-color: transparent; }
    .chip.active[data-v='0'] { background: #9ca3af; }
    .chip.active[data-v='25'] { background: #f97316; }
    .chip.active[data-v='50'] { background: #eab308; }
    .chip.active[data-v='75'] { background: #22c55e; }
    .chip.active[data-v='100'] { background: #4f46e5; }

    .add-chapter { display: flex; gap: 0.5rem; margin-top: 1.1rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; }
    .add-chapter input { flex: 1; min-width: 0; }
    .error { color: #dc2626; }
  `,
})
export class Subjects {
  private readonly subjectsService = inject(SubjectsService);
  private readonly progressService = inject(ProgressService);

  readonly levels = [
    { value: 0, label: 'Pas vu' },
    { value: 25, label: 'Débutant' },
    { value: 50, label: 'Moyen' },
    { value: 75, label: 'Bon' },
    { value: 100, label: 'Maîtrisé' },
  ];

  readonly subjects = signal<Subject[]>([]);
  readonly mastery = signal<Record<string, number>>({});
  readonly loading = signal(true);
  readonly error = signal('');
  readonly actionError = signal('');

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
        this.error.set('Impossible de charger les matières');
        this.loading.set(false);
      },
    });
  }

  level(chapterId: string): number {
    return this.mastery()[chapterId] ?? 0;
  }

  /** Niveau le plus proche parmi 0, 25, 50, 75, 100 (pour l'affichage). */
  current(chapterId: string): number {
    const v = this.level(chapterId);
    return this.levels.reduce((best, l) =>
      Math.abs(l.value - v) < Math.abs(best.value - v) ? l : best,
    ).value;
  }

  subjectAverage(subject: Subject): number {
    if (!subject.chapters.length) return 0;
    const total = subject.chapters.reduce((sum, c) => sum + this.level(c.id), 0);
    return Math.round(total / subject.chapters.length);
  }

  setLevel(chapterId: string, value: number) {
    this.actionError.set('');
    this.mastery.update((m) => ({ ...m, [chapterId]: value }));
    this.progressService.update(chapterId, value).subscribe({
      error: () => this.actionError.set("Impossible d'enregistrer le niveau"),
    });
  }

  addSubject(input: HTMLInputElement) {
    const name = input.value.trim();
    if (name.length < 2) return;
    this.actionError.set('');
    this.subjectsService.create(name).subscribe({
      next: (s) => {
        this.subjects.update((list) => [...list, s]);
        input.value = '';
      },
      error: () => this.actionError.set("Impossible d'ajouter la matière"),
    });
  }

  removeSubject(subject: Subject) {
    if (!confirm(`Supprimer la matière « ${subject.name} » et ses chapitres ?`)) return;
    this.subjectsService.remove(subject.id).subscribe({
      next: () => this.subjects.update((list) => list.filter((s) => s.id !== subject.id)),
      error: () => this.actionError.set('Impossible de supprimer la matière'),
    });
  }

  addChapter(subject: Subject, input: HTMLInputElement) {
    const title = input.value.trim();
    if (title.length < 2) return;
    this.actionError.set('');
    this.subjectsService.addChapter(subject.id, title).subscribe({
      next: (chapter) => {
        this.subjects.update((list) =>
          list.map((s) =>
            s.id === subject.id ? { ...s, chapters: [...s.chapters, chapter] } : s,
          ),
        );
        input.value = '';
      },
      error: () => this.actionError.set("Impossible d'ajouter le chapitre"),
    });
  }

  removeChapter(subject: Subject, chapterId: string) {
    this.subjectsService.removeChapter(subject.id, chapterId).subscribe({
      next: () =>
        this.subjects.update((list) =>
          list.map((s) =>
            s.id === subject.id
              ? { ...s, chapters: s.chapters.filter((c) => c.id !== chapterId) }
              : s,
          ),
        ),
      error: () => this.actionError.set('Impossible de supprimer le chapitre'),
    });
  }
}