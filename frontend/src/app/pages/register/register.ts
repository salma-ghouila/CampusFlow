import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return password === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
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
            <span class="pill">🚀 Inscription gratuite</span>
            <h2>Rejoignez <em>CampusFlow</em></h2>
            <p>
              Créez votre compte en quelques secondes et commencez à organiser vos études
              dès aujourd'hui.
            </p>

            <div class="mini-cards">
              <div class="mini"><span>🎯</span><div><b>Suivi personnalisé</b><small>Adapté à votre filière</small></div></div>
              <div class="mini"><span>📁</span><div><b>Ressources</b><small>Cours, résumés, exercices</small></div></div>
              <div class="mini"><span>🤝</span><div><b>Communauté</b><small>Des étudiants comme vous</small></div></div>
            </div>
          </div>

          <small class="copy">© 2026 CampusFlow</small>
        </section>

        <section class="side">
          <form class="card" [formGroup]="form" (ngSubmit)="submit()">
            <div class="wave">✨</div>
            <h1>Créer un compte</h1>
            <p class="lead">Quelques informations suffisent pour commencer.</p>

            <label for="fullName">Nom complet</label>
            <div class="field">
              <span class="ico">👤</span>
              <input id="fullName" type="text" formControlName="fullName" placeholder="Amine Ben Salah" autocomplete="name" />
            </div>

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
                placeholder="8 caractères minimum"
                autocomplete="new-password"
              />
              <button type="button" class="eye" (click)="showPassword.set(!showPassword())" aria-label="Afficher le mot de passe">
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>

            @if (password()) {
              <div class="strength">
                <div class="meter">
                  @for (i of [1, 2, 3, 4]; track i) {
                    <span [class.on]="strength().score >= i" [attr.data-level]="strength().score"></span>
                  }
                </div>
                <small>{{ strength().label }}</small>
              </div>
            }

            <label for="confirm">Confirmer le mot de passe</label>
            <div class="field">
              <span class="ico">🔑</span>
              <input
                id="confirm"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="confirm"
                placeholder="Retapez le mot de passe"
                autocomplete="new-password"
              />
            </div>

            @if (form.hasError('mismatch') && form.controls.confirm.dirty) {
              <p class="hint">Les mots de passe ne correspondent pas.</p>
            }

            @if (error()) {
              <div class="alert">⚠️ {{ error() }}</div>
            }

            <button type="submit" class="submit" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <span class="spinner"></span> Création...
              } @else {
                Créer mon compte →
              }
            </button>

            <div class="divider"><span>ou</span></div>

            <p class="alt">Déjà inscrit ? <a routerLink="/login">Se connecter</a></p>
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
    .b2 { width: 360px; height: 360px; background: #22d3ee; bottom: -120px; left: 35%; animation-delay: -5s; opacity: 0.4; }
    .b3 { width: 380px; height: 380px; background: #ec4899; top: 20%; right: -120px; animation-delay: -9s; }
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(40px, -30px) scale(1.1); }
    }

    .wrap { position: relative; z-index: 1; display: grid; grid-template-columns: 1.15fr 1fr; min-height: 100vh; }

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
    .copy { color: #a5b4fc; }

    .side { display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .card { width: 100%; max-width: 440px; background: rgba(255,255,255,0.97); border-radius: 22px; padding: 2.2rem 2.2rem;
      display: flex; flex-direction: column; gap: 0.35rem; box-shadow: 0 30px 70px rgba(0,0,0,0.4); animation: rise 0.6s ease-out; }
    @keyframes rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
    .wave { font-size: 2rem; }
    .card h1 { margin: 0; font-size: 1.7rem; }
    .lead { color: #6b7280; margin: 0.2rem 0 1rem; }
    label { font-size: 0.85rem; font-weight: 600; color: #374151; margin-top: 0.45rem; }

    .field { position: relative; }
    .field .ico { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); font-size: 1rem; opacity: 0.7; }
    .field input { width: 100%; padding: 0.8rem 2.8rem; border: 1.5px solid #e5e7eb; border-radius: 12px; font: inherit;
      background: #f9fafb; transition: all 0.15s; }
    .field input:focus { outline: none; border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px #e0e7ff; }
    .eye { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); border: none; background: none;
      cursor: pointer; font-size: 1rem; padding: 0.4rem; }

    .strength { display: flex; align-items: center; gap: 0.7rem; }
    .meter { display: flex; gap: 4px; flex: 1; }
    .meter span { height: 5px; flex: 1; border-radius: 999px; background: #e5e7eb; transition: background 0.2s; }
    .meter span.on[data-level='1'] { background: #ef4444; }
    .meter span.on[data-level='2'] { background: #f59e0b; }
    .meter span.on[data-level='3'] { background: #84cc16; }
    .meter span.on[data-level='4'] { background: #16a34a; }
    .strength small { color: #6b7280; min-width: 60px; text-align: right; }

    .hint { color: #b45309; font-size: 0.85rem; margin: 0.1rem 0 0; }
    .alert { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 0.7rem 0.9rem; border-radius: 10px;
      font-size: 0.9rem; margin-top: 0.6rem; }

    .submit { margin-top: 1rem; padding: 0.95rem; border: none; border-radius: 12px; color: #fff; font: inherit; font-weight: 700;
      cursor: pointer; background: linear-gradient(135deg, #4f46e5, #7c3aed); box-shadow: 0 8px 20px rgba(79,70,229,0.35);
      display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: transform 0.15s, box-shadow 0.15s; }
    .submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(79,70,229,0.45); }
    .submit:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%;
      animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .divider { display: flex; align-items: center; gap: 0.8rem; color: #9ca3af; font-size: 0.85rem; margin: 0.8rem 0 0.3rem; }
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
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });

  readonly strength = computed(() => {
    const p = this.password();
    let score = 0;
    if (p.length >= 8) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
    return { score, label: labels[score] };
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { fullName, email, password } = this.form.getRawValue();
    this.auth.register(fullName, email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.message;
        this.error.set(Array.isArray(msg) ? msg.join(', ') : (msg ?? "Erreur d'inscription"));
      },
    });
  }
}