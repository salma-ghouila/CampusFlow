import { Component, computed, inject, signal } from '@angular/core';
import { Question, QuizService } from '../../core/quiz.service';
import { ProgressBar } from '../../shared/components/progress-bar';

type Step = 'config' | 'loading' | 'play' | 'result';

@Component({
  selector: 'app-quiz',
  imports: [ProgressBar],
  template: `
    <header class="head">
      <h1>Quiz personnalisé ✦</h1>
      <p>Un quiz généré par l'assistant IA, adapté à ton niveau.</p>
    </header>

    @switch (step()) {
      @case ('config') {
        <div class="layout">
          <section class="panel" aria-label="Configuration">
            <h2>Configuration</h2>
            <label for="subject">Matière</label>
            <select id="subject" #subject>
              @for (s of service.subjects; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
            <button type="button" class="primary" (click)="start(subject.value)">Lancer le quiz</button>
          </section>

          <section class="panel" aria-label="Historique">
            <h2>Historique des quiz</h2>
            @for (h of service.history; track h.title) {
              <div class="hist">
                <span class="score">{{ h.score }}/20</span>
                <div>
                  <strong>{{ h.title }}</strong>
                  <small>{{ h.subject }}</small>
                </div>
              </div>
            }
          </section>
        </div>
      }

      @case ('loading') {
        <div class="skeleton" aria-busy="true" aria-label="Génération du quiz"></div>
      }

      @case ('play') {
        <section class="panel" aria-label="Question">
          <p class="count">Question {{ index() + 1 }} sur {{ questions().length }}</p>
          <app-progress-bar [value]="percent()" label="Avancement du quiz" />
          <h2 class="question">{{ current().text }}</h2>
          <div class="options" role="group" aria-label="Réponses">
            @for (o of current().options; track $index) {
              <button type="button" class="option" [class.selected]="answers()[index()] === $index"
                      [attr.aria-pressed]="answers()[index()] === $index" (click)="choose($index)">
                {{ letters[$index] }} · {{ o }}
              </button>
            }
          </div>
          <div class="nav">
            <button type="button" class="secondary" (click)="prev()" [disabled]="index() === 0">Précédent</button>
            @if (index() < questions().length - 1) {
              <button type="button" class="primary" (click)="next()" [disabled]="answers()[index()] === undefined">Suivant</button>
            } @else {
              <button type="button" class="primary" (click)="finish()" [disabled]="answers()[index()] === undefined">Terminer le quiz</button>
            }
          </div>
        </section>
      }

      @case ('result') {
        <section class="stats">
          <div class="stat"><small>Score</small><strong>{{ score() }} / {{ questions().length }}</strong></div>
          <div class="stat"><small>Sur 20</small><strong>{{ scoreOn20() }}</strong></div>
          <div class="stat"><small>Maîtrise du chapitre</small><strong>{{ mastery() }} %</strong></div>
        </section>

        <section class="panel" aria-label="Corrections détaillées">
          <h2>Corrections détaillées</h2>
          @for (q of questions(); track q.id; let i = $index) {
            <div class="correction" [class.ok]="answers()[i] === q.answer" [class.ko]="answers()[i] !== q.answer">
              <strong>{{ answers()[i] === q.answer ? '✓' : '✕' }} Q{{ i + 1 }} · {{ q.text }}</strong>
              @if (answers()[i] !== q.answer) {
                <p>Ta réponse : {{ q.options[answers()[i]] }}. Bonne réponse : {{ q.options[q.answer] }}.</p>
              }
              <p class="expl">{{ q.explanation }}</p>
            </div>
          }
          <button type="button" class="primary" (click)="restart()">Refaire un quiz</button>
        </section>
      }
    }
  `,
  styles: `
    .head h1 { margin: 0; }
    .head p { color: #6b7280; margin: 0.3rem 0 1.4rem; }
    .layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; align-items: start; }
    .panel { background: #fff; padding: 1.3rem; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 0.8rem; }
    .panel h2 { margin: 0; font-size: 1.1rem; }
    label { font-weight: 600; }
    select { padding: 0.7rem 0.9rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font: inherit; background: #fff; }
    select:focus, button:focus-visible { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px #e0e7ff; }
    .primary { padding: 0.7rem 1.1rem; border: none; border-radius: 10px; background: #4f46e5; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
    .primary:hover:not(:disabled) { background: #4338ca; }
    .secondary { padding: 0.7rem 1.1rem; border: 1.5px solid #e5e7eb; border-radius: 10px; background: #fff; font: inherit; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .hist { display: flex; gap: 0.7rem; align-items: center; padding: 0.5rem 0; border-top: 1px solid #f3f4f6; }
    .hist div { display: flex; flex-direction: column; }
    small { color: #6b7280; }
    .score { background: #eef2ff; color: #4f46e5; font-weight: 700; padding: 0.25rem 0.55rem; border-radius: 8px; font-size: 0.85rem; }
    .count { margin: 0; color: #6b7280; }
    .question { margin: 0.5rem 0; }
    .options { display: flex; flex-direction: column; gap: 0.5rem; }
    .option { text-align: left; padding: 0.8rem 1rem; border: 1.5px solid #e5e7eb; border-radius: 10px; background: #fff; font: inherit; cursor: pointer; transition: all 0.12s; }
    .option:hover { border-color: #a5b4fc; background: #eef2ff; }
    .option.selected { border-color: #4f46e5; background: #eef2ff; font-weight: 600; }
    .nav { display: flex; justify-content: space-between; margin-top: 0.5rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .stat { background: #fff; padding: 1.1rem 1.2rem; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 0.2rem; }
    .stat strong { font-size: 1.7rem; color: #4f46e5; }
    .correction { padding: 0.8rem 1rem; border-radius: 10px; border: 1.5px solid; }
    .correction.ok { background: #ecfdf5; border-color: #a7f3d0; }
    .correction.ko { background: #fef2f2; border-color: #fecaca; }
    .correction p { margin: 0.3rem 0 0; font-size: 0.9rem; }
    .expl { color: #6b7280; }
    .skeleton { height: 260px; border-radius: 14px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
    @keyframes shimmer { to { background-position: -200% 0; } }
  `,
})
export class Quiz {
  readonly service = inject(QuizService);

  readonly letters = ['A', 'B', 'C', 'D'];
  readonly step = signal<Step>('config');
  readonly questions = signal<Question[]>([]);
  readonly answers = signal<number[]>([]);
  readonly index = signal(0);

  readonly current = computed(() => this.questions()[this.index()]);
  readonly percent = computed(() =>
    this.questions().length ? Math.round(((this.index() + 1) / this.questions().length) * 100) : 0,
  );
  readonly score = computed(
    () => this.questions().filter((q, i) => this.answers()[i] === q.answer).length,
  );
  readonly scoreOn20 = computed(() =>
    this.questions().length ? Math.round((this.score() / this.questions().length) * 20) : 0,
  );
  readonly mastery = computed(() =>
    this.questions().length ? Math.round((this.score() / this.questions().length) * 100) : 0,
  );

  start(subject: string) {
    this.step.set('loading');
    this.service.getQuestions(subject).subscribe((list) => {
      this.questions.set(list);
      this.answers.set([]);
      this.index.set(0);
      this.step.set('play');
    });
  }

  choose(option: number) {
    this.answers.update((a) => {
      const copy = [...a];
      copy[this.index()] = option;
      return copy;
    });
  }

  next() {
    this.index.update((i) => i + 1);
  }

  prev() {
    this.index.update((i) => i - 1);
  }

  finish() {
    this.step.set('result');
  }

  restart() {
    this.step.set('config');
  }
}