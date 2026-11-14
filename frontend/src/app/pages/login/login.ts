import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="blob b3"></div>

      <div class="wrap">
        <section class="brand">
          <a routerLink="/" class="logo">🎓 CampusFlow</a>

          <div class="hero">
            <span class="pill">✨ Plateforme étudiante</span>
            <h2>Bienvenue dans <em>CampusFlow</em></h2>
            <p>
              Organisez vos révisions, suivez votre progression chapitre par chapitre et
              partagez vos ressources, le tout dans un seul espace.
            </p>

            <div class="mini-cards">
              <div class="mini"><span>📊</span><div><b>Progression</b><small>Suivez votre maîtrise</small></div></div>
              <div class="mini"><span>📅</span><div><b>Planning</b><small>Révisez au bon moment</small></div></div>
              <div class="mini"><span>👥</span><div><b>Groupes</b><small>Étudiez ensemble</small></div></div>
            </div>
          </div>

          <blockquote>
            « Je vois enfin clairement ce que je dois réviser avant mes examens. »
            <cite>— Un étudiant de Licence 2</cite>
          </blockquote>
        </section>

        <section class="side">
          <form class="card" [formGroup]="form" (ngSubmit)="submit()">
            <div class="wave">👋</div>
            <h1>Content de vous revoir</h1>
            <p class="lead">Connectez-vous pour accéder à votre espace.</p>

            <label for="email">Adresse email</label>
            <div class="field">
              <span class="ico">✉️</span>
              <input id="email" type="email" formControlName="email" placeholder="vous@campus.tn" autocomplete="email" />
            </div>

            <label for="password">Mot de passe</label>
            <div class="field">
              <span class="ico">🔒</span>
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button type="button" class="eye" (click)="showPassword.set(!showPassword())" [attr.aria-label]="'Afficher le mot de passe'">
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>

            @if (error()) {
              <div class="alert">⚠️ {{ error() }}</div>
            }

            <button type="submit" class="submit" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <span class="spinner"></span> Connexion...
              } @else {
                Se connecter →
              }
            </button>

            <div class="divider"><span>ou</span></div>

            <p class="alt">Pas encore de compte ? <a routerLink="/register">Créer un compte</a></p>
            <p class="alt"><a routerLink="/">← Retour à l'accueil</a></p>
          </form>
        </section>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .page { position: relative; min-height: 100vh; overflow: hidden;
      background: linear-gradient(135deg, #0f172a, #1e1b4b 50%, #312e81); }

    .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.55; animation: float 14s ease-in-out infinite; }
    .b1 { width: 420px; height: 420px; background: #6366f1; top: -120px; left: -80px; }
    .b2 { width: 360px; height: 360px; background: #ec4899; bottom: -120px; left: 35%; animation-delay: -5s; }
    .b3 { width: 380px; height: 380px; background: #22d3ee; top: 20%; right: -120px; animation-delay: -9s; opacity: 0.4; }
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(40px, -30px) scale(1.1); }
    }

    .wrap { position: relative; z-index: 1; display: grid; grid-template-columns: 1.15fr 1fr; min-height: 100vh; }

    /* Panneau gauche */
    .brand { display: flex; flex-direction: column; justify-content: space-between; padding: 2.5rem 4rem; color: #fff; }
    .logo { color: #fff; font-weight: 800; font-size: 1.3rem; text-decoration: none; }
    .pill { display: inline-block; padding: 0.35rem 0.9rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600;
      background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(6px); }
    .hero h2 { font-size: clamp(2.2rem, 4vw, 3.2rem); line-height: 1.1; margin: 1.2rem 0 1rem; }
    .hero em { font-style: normal; background: linear-gradient(90deg, #a5b4fc, #67e8f9);
      -webkit-background-clip: text; background-clip: text; color: transparent; }
    .hero p { color: #c7d2fe; font-size: 1.1rem; line-height: 1.6; max-width: 460px; margin: 0; }
    .mini-cards { display: flex; flex-direction: column; gap: 0.7rem; margin-top: 2rem; max-width: 380px; }
    .mini { display: flex; align-items: center; gap: 0.9rem; padding: 0.8rem 1rem; border-radius: 14px;
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(8px); }
    .mini span { font-size: 1.5rem; }
    .mini b { display: block; }
    .mini small { color: #c7d2fe; }
    blockquote { margin: 0; padding-left: 1rem; border-left: 3px solid #818cf8; color: #e0e7ff; font-style: italic; max-width: 440px; }
    cite { display: block; margin-top: 0.4rem; font-style: normal; font-size: 0.85rem; color: #a5b4fc; }

    /* Carte de connexion */
    .side { display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .card { width: 100%; max-width: 420px; background: rgba(255,255,255,0.97); border-radius: 22px; padding: 2.4rem 2.2rem;
      display: flex; flex-direction: column; gap: 0.4rem; box-shadow: 0 30px 70px rgba(0,0,0,0.4); animation: rise 0.6s ease-out; }
    @keyframes rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
    .wave { font-size: 2.2rem; }
    .card h1 { margin: 0; font-size: 1.7rem; }
    .lead { color: #6b7280; margin: 0.2rem 0 1.2rem; }
    label { font-size: 0.85rem; font-weight: 600; color: #374151; margin-top: 0.5rem; }

    .field { position: relative; }
    .field .ico { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); font-size: 1rem; opacity: 0.7; }
    .field input { width: 100%; padding: 0.85rem 2.8rem; border: 1.5px solid #e5e7eb; border-radius: 12px; font: inherit;
      background: #f9fafb; transition: all 0.15s; }
    .field input:focus { outline: none; border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px #e0e7ff; }
    .eye { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); border: none; background: none;
      cursor: pointer; font-size: 1rem; padding: 0.4rem; }

    .alert { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 0.7rem 0.9rem; border-radius: 10px;
      font-size: 0.9rem; margin-top: 0.6rem; }

    .submit { margin-top: 1.1rem; padding: 0.95rem; border: none; border-radius: 12px; color: #fff; font: inherit; font-weight: 700;
      cursor: pointer; background: linear-gradient(135deg, #4f46e5, #7c3aed); box-shadow: 0 8px 20px rgba(79,70,229,0.35);
      display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: transform 0.15s, box-shadow 0.15s; }
    .submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(79,70,229,0.45); }
    .submit:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%;
      animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .divider { display: flex; align-items: center; gap: 0.8rem; color: #9ca3af; font-size: 0.85rem; margin: 0.9rem 0 0.3rem; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
    .alt { text-align: center; font-size: 0.9rem; color: #6b7280; margin: 0.3rem 0 0; }
    .alt a { color: #4f46e5; font-weight: 600; text-decoration: none; }
    .alt a:hover { text-decoration: underline; }

    @media (max-width: 900px) {
      .wrap { grid-template-columns: 1fr; }
      .brand { display: none; }
    }
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Erreur de connexion');
      },
    });
  }
}