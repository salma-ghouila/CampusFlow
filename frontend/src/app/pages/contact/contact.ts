import { Component, signal } from '@angular/core';
import { PageHeader } from '../../shared/components/page-header';
import { PublicHeader } from '../../shared/components/public-header';

@Component({
  selector: 'app-contact',
  imports: [PublicHeader, PageHeader],
  template: `
    <app-public-header />
    <main class="wrap">
      <app-page-header
        title="Contactez-nous"
        subtitle="Une question ou une suggestion ? Écris-nous."
      />

      @if (sent()) {
        <div class="success" role="status">
          ✅ Merci ! Ton message a bien été envoyé. Nous te répondrons rapidement.
          <button type="button" class="link" (click)="sent.set(false)">
            Envoyer un autre message
          </button>
        </div>
      } @else {
        <section class="card" aria-label="Formulaire de contact">
          <label for="name">Nom</label>
          <input id="name" #name autocomplete="name" />

          <label for="email">Adresse e-mail</label>
          <input id="email" #email type="email" autocomplete="email" />

          <label for="topic">Sujet</label>
          <select id="topic" #topic>
            <option>Question générale</option>
            <option>Problème technique</option>
            <option>Suggestion</option>
          </select>

          <label for="message">Message</label>
          <textarea id="message" #message rows="5"></textarea>

          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }
          <button type="button" class="primary" (click)="send(name, email, message)">
            Envoyer le message
          </button>
        </section>
      }
    </main>
  `,
  styles: `
    .wrap {
      max-width: 560px;
      margin: 0 auto;
      padding: 2rem 1.2rem 3rem;
    }
    .card {
      background: #fff;
      padding: 1.5rem;
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    label {
      font-weight: 600;
      margin-top: 0.4rem;
    }
    input,
    select,
    textarea {
      padding: 0.7rem 0.9rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      font: inherit;
      background: #fff;
    }
    input:focus,
    select:focus,
    textarea:focus,
    button:focus-visible {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px #e0e7ff;
    }
    .primary {
      margin-top: 0.8rem;
      padding: 0.75rem;
      border: none;
      border-radius: 10px;
      background: #4f46e5;
      color: #fff;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .primary:hover {
      background: #4338ca;
    }
    .success {
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      color: #047857;
      padding: 1.2rem;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .link {
      align-self: flex-start;
      border: none;
      background: none;
      color: #4f46e5;
      font: inherit;
      text-decoration: underline;
      cursor: pointer;
      padding: 0;
    }
    .error {
      color: #dc2626;
      margin: 0;
    }
  `,
})
export class Contact {
  readonly sent = signal(false);
  readonly error = signal('');

  /** Simulation d'envoi : aucune donnée n'est transmise (mock). */
  send(name: HTMLInputElement, email: HTMLInputElement, message: HTMLTextAreaElement) {
    if (
      name.value.trim().length < 2 ||
      !email.value.includes('@') ||
      message.value.trim().length < 5
    ) {
      this.error.set('Merci de renseigner ton nom, un e-mail valide et un message.');
      return;
    }
    this.error.set('');
    this.sent.set(true);
  }
}
