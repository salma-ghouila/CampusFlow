import { Component, inject, signal } from '@angular/core';
import { AssistantService } from '../../core/assistant.service';

interface Message {
  from: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-assistant',
  template: `
    <header class="head">
      <h1>Assistant IA ✦</h1>
      <p>Pose tes questions, génère des quiz et obtiens ton plan d'étude.</p>
    </header>

    <div class="layout">
      <section class="chat" aria-label="Discussion">
        <div class="messages" role="log" aria-live="polite">
          @for (m of messages(); track $index) {
            <div class="msg" [class.user]="m.from === 'user'" [class.ai]="m.from === 'ai'">
              {{ m.text }}
            </div>
          }
          @if (thinking()) {
            <div class="msg ai typing" aria-label="L'assistant écrit">
              <span></span><span></span><span></span>
            </div>
          }
        </div>

        <div class="send">
          <input #input placeholder="Écris ton message..." aria-label="Ton message"
                 (keyup.enter)="send(input)" />
          <button type="button" (click)="send(input)" [disabled]="thinking()">Envoyer</button>
        </div>
      </section>

      <aside class="side">
        <section class="panel" aria-label="Actions rapides">
          <h2>Actions rapides</h2>
          @for (a of quickActions; track a.label) {
            <button type="button" class="quick" (click)="ask(a.question)" [disabled]="thinking()">
              {{ a.label }}
            </button>
          }
        </section>

        <section class="panel" aria-label="Recommandations">
          <h2>Recommandations</h2>
          @for (r of recommendations; track r.title) {
            <div class="reco">
              <span class="tag">{{ r.tag }}</span>
              <div>
                <strong>{{ r.title }}</strong>
                <small>{{ r.hint }}</small>
              </div>
            </div>
          }
        </section>
      </aside>
    </div>
  `,
  styles: `
    .head h1 { margin: 0; }
    .head p { color: #6b7280; margin: 0.3rem 0 1.4rem; }
    .layout { display: grid; grid-template-columns: 1fr 280px; gap: 1rem; align-items: start; }
    .chat { background: #fff; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; flex-direction: column; min-height: 420px; }
    .messages { flex: 1; padding: 1.2rem; display: flex; flex-direction: column; gap: 0.7rem; max-height: 420px; overflow-y: auto; }
    .msg { max-width: 80%; padding: 0.7rem 0.95rem; border-radius: 14px; line-height: 1.4; animation: pop 0.2s ease-out; }
    .msg.user { align-self: flex-end; background: linear-gradient(135deg, #4f46e5, #8b5cf6); color: #fff; }
    .msg.ai { align-self: flex-start; background: #eef2ff; color: #1e1b4b; }
    @keyframes pop { from { opacity: 0; transform: translateY(6px); } }
    .typing { display: flex; gap: 0.3rem; }
    .typing span { width: 7px; height: 7px; border-radius: 50%; background: #8b5cf6; animation: blink 1s infinite; }
    .typing span:nth-child(2) { animation-delay: 0.15s; }
    .typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes blink { 50% { opacity: 0.25; } }
    .send { display: flex; gap: 0.6rem; padding: 0.9rem; border-top: 1px solid #f3f4f6; }
    .send input { flex: 1; padding: 0.7rem 0.9rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font: inherit; }
    .send input:focus, button:focus-visible { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px #e0e7ff; }
    .send button { padding: 0.7rem 1.1rem; border: none; border-radius: 10px; background: #4f46e5; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
    .send button:hover:not(:disabled) { background: #4338ca; }
    button:disabled { opacity: 0.55; cursor: not-allowed; }
    .side { display: flex; flex-direction: column; gap: 1rem; }
    .panel { background: #fff; border-radius: 14px; padding: 1.1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
    .panel h2 { margin: 0 0 0.8rem; font-size: 1.05rem; }
    .quick { display: block; width: 100%; text-align: left; margin-bottom: 0.5rem; padding: 0.6rem 0.8rem; border: 1.5px solid #e5e7eb; background: #fff; border-radius: 10px; font: inherit; cursor: pointer; transition: all 0.12s; }
    .quick:hover:not(:disabled) { border-color: #a5b4fc; background: #eef2ff; }
    .reco { display: flex; gap: 0.7rem; align-items: center; padding: 0.5rem 0; border-top: 1px solid #f3f4f6; }
    .reco div { display: flex; flex-direction: column; }
    .reco small { color: #6b7280; }
    .tag { background: #f5f3ff; color: #7c3aed; font-weight: 700; font-size: 0.78rem; padding: 0.25rem 0.55rem; border-radius: 8px; }
    @media (max-width: 800px) { .layout { grid-template-columns: 1fr; } }
  `,
})
export class Assistant {
  private readonly service = inject(AssistantService);

  readonly recommendations = this.service.recommendations;
  readonly quickActions = [
    { label: '🎯 Générer un quiz', question: 'Je veux un quiz' },
    { label: '🗓️ Générer un plan d\'étude', question: 'Donne-moi un plan de révision' },
    { label: '🔍 Mes points faibles', question: 'Explique-moi le routage' },
  ];

  readonly messages = signal<Message[]>([
    { from: 'ai', text: 'Bonjour ! Je suis ton assistant d\'étude. Pose-moi une question sur tes cours.' },
  ]);
  readonly thinking = signal(false);

  send(input: HTMLInputElement) {
    const text = input.value.trim();
    if (!text || this.thinking()) return;
    input.value = '';
    this.ask(text);
  }

  ask(text: string) {
    if (this.thinking()) return;
    this.messages.update((list) => [...list, { from: 'user', text }]);
    this.thinking.set(true);
    this.service.ask(text).subscribe((answer) => {
      this.messages.update((list) => [...list, { from: 'ai', text: answer }]);
      this.thinking.set(false);
    });
  }
}