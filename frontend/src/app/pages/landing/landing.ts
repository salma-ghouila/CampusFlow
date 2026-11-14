import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <header class="nav">
      <a routerLink="/" class="brand">🎓 CampusFlow</a>
      <nav>
        <a href="#features">Fonctionnalités</a>
        <a href="#how">Comment ça marche</a>
      </nav>
      <div class="actions">
        @if (auth.isLoggedIn()) {
          <a routerLink="/dashboard" class="btn primary">Mon espace</a>
        } @else {
          <a routerLink="/login" class="btn ghost">Connexion</a>
          <a routerLink="/register" class="btn primary">S'inscrire</a>
        }
      </div>
    </header>

    <section class="hero">
      <span class="pill">Plateforme étudiante tout-en-un</span>
      <h1>Bienvenue dans <em>CampusFlow</em></h1>
      <p>
        Organisez vos révisions, suivez votre progression chapitre par chapitre et
        partagez vos ressources avec vos camarades, le tout dans un seul espace
        simple et clair.
      </p>
      <div class="cta">
        @if (auth.isLoggedIn()) {
          <a routerLink="/dashboard" class="btn primary big">Accéder à mon espace</a>
        } @else {
          <a routerLink="/register" class="btn primary big">Commencer gratuitement</a>
          <a routerLink="/login" class="btn light big">Se connecter</a>
        }
      </div>
      <div class="stats">
        <div><strong>∞</strong><span>matières personnalisables</span></div>
        <div><strong>100 %</strong><span>suivi personnalisé</span></div>
        <div><strong>24/7</strong><span>accessible partout</span></div>
      </div>
    </section>

    <section id="features" class="section">
      <h2>Tout ce qu'il faut pour réussir</h2>
      <p class="sub">Des outils pensés pour la vie étudiante.</p>
      <div class="grid">
        @for (f of features; track f.title) {
          <article class="feature">
            <div class="icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.text }}</p>
          </article>
        }
      </div>
    </section>

    <section id="how" class="section alt">
      <h2>Comment ça marche</h2>
      <p class="sub">Trois étapes pour bien démarrer.</p>
      <div class="steps">
        @for (s of steps; track s.title; let i = $index) {
          <div class="step">
            <span class="num">{{ i + 1 }}</span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </div>
        }
      </div>
    </section>

    <section class="band">
      <h2>Prêt à organiser vos études ?</h2>
      <p>Créez votre compte en moins d'une minute.</p>
      <a routerLink="/register" class="btn light big">Créer mon compte</a>
    </section>

    <footer class="footer">
      <span>🎓 CampusFlow</span>
      <span>© 2026 CampusFlow. Projet étudiant.</span>
    </footer>
  `,
  styles: `
    :host { display: block; color: #111827; scroll-behavior: smooth; }
    a { text-decoration: none; }

    .nav { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between;
      padding: 0.9rem 3rem; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border-bottom: 1px solid #eef0f4; }
    .brand { font-weight: 800; font-size: 1.2rem; color: #312e81; }
    .nav nav { display: flex; gap: 2rem; }
    .nav nav a { color: #4b5563; font-weight: 500; }
    .nav nav a:hover { color: #4f46e5; }
    .actions { display: flex; gap: 0.6rem; }

    .btn { display: inline-block; padding: 0.55rem 1.1rem; border-radius: 10px; font-weight: 600; transition: all 0.15s; }
    .btn.big { padding: 0.85rem 1.6rem; font-size: 1rem; }
    .btn.primary { background: #4f46e5; color: #fff; }
    .btn.primary:hover { background: #4338ca; }
    .btn.ghost { color: #4f46e5; }
    .btn.ghost:hover { background: #eef2ff; }
    .btn.light { background: #fff; color: #4f46e5; border: 1px solid #c7d2fe; }
    .btn.light:hover { background: #eef2ff; }

    .hero { text-align: center; padding: 5rem 1.5rem 4rem;
      background: radial-gradient(circle at 50% 0%, #e0e7ff, #f5f6fa 70%); }
    .pill { display: inline-block; background: #eef2ff; color: #4f46e5; padding: 0.35rem 0.9rem;
      border-radius: 999px; font-size: 0.85rem; font-weight: 600; }
    .hero h1 { font-size: clamp(2.2rem, 5vw, 3.6rem); margin: 1.2rem 0 1rem; line-height: 1.1; }
    .hero em { font-style: normal; background: linear-gradient(90deg, #4f46e5, #818cf8);
      -webkit-background-clip: text; background-clip: text; color: transparent; }
    .hero p { max-width: 640px; margin: 0 auto 2rem; font-size: 1.15rem; color: #4b5563; line-height: 1.6; }
    .cta { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; }
    .stats { display: flex; gap: 3rem; justify-content: center; margin-top: 3.5rem; flex-wrap: wrap; }
    .stats div { display: flex; flex-direction: column; }
    .stats strong { font-size: 1.8rem; color: #4f46e5; }
    .stats span { color: #6b7280; font-size: 0.9rem; }

    .section { padding: 4.5rem 3rem; text-align: center; }
    .section.alt { background: #fff; }
    .section h2 { font-size: 2rem; margin: 0 0 0.5rem; }
    .sub { color: #6b7280; margin: 0 0 2.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.2rem; max-width: 1100px; margin: 0 auto; }
    .feature { background: #fff; padding: 1.6rem; border-radius: 16px; text-align: left;
      box-shadow: 0 2px 14px rgba(0,0,0,0.06); transition: transform 0.15s; }
    .feature:hover { transform: translateY(-4px); }
    .icon { width: 48px; height: 48px; border-radius: 12px; background: #eef2ff; display: flex;
      align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem; }
    .feature h3 { margin: 0 0 0.4rem; }
    .feature p { margin: 0; color: #6b7280; line-height: 1.5; }

    .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; max-width: 960px; margin: 0 auto; }
    .num { display: inline-flex; width: 46px; height: 46px; border-radius: 50%; background: #4f46e5; color: #fff;
      align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem; }
    .step h3 { margin: 1rem 0 0.4rem; }
    .step p { color: #6b7280; margin: 0; line-height: 1.5; }

    .band { text-align: center; padding: 4rem 1.5rem; color: #fff;
      background: linear-gradient(135deg, #312e81, #4f46e5); }
    .band h2 { margin: 0 0 0.5rem; font-size: 2rem; }
    .band p { margin: 0 0 1.6rem; color: #c7d2fe; }

    .footer { display: flex; justify-content: space-between; padding: 1.5rem 3rem; color: #6b7280;
      font-size: 0.9rem; flex-wrap: wrap; gap: 0.5rem; }

    @media (max-width: 700px) {
      .nav { padding: 0.8rem 1rem; } .nav nav { display: none; }
      .section { padding: 3rem 1.2rem; } .footer { padding: 1.2rem; }
    }
  `,
})
export class Landing {
  readonly auth = inject(AuthService);

  readonly features = [
    { icon: '📊', title: 'Suivi de progression', text: 'Évaluez votre maîtrise de chaque chapitre et visualisez vos progrès en un coup d’œil.' },
    { icon: '📚', title: 'Matières personnalisées', text: 'Ajoutez vos propres matières et chapitres, et indiquez votre niveau pour chacun.' },
    { icon: '📁', title: 'Ressources partagées', text: 'Déposez et consultez cours, résumés et exercices avec la communauté.' },
    { icon: '📅', title: 'Planning de révision', text: 'Planifiez vos examens et vos sessions d’étude selon votre disponibilité.' },
    { icon: '👥', title: 'Groupes d’étude', text: 'Révisez à plusieurs et échangez avec vos camarades.' },
    { icon: '🤖', title: 'Assistant intelligent', text: 'Générez des quiz adaptés à votre niveau pour vous tester.' },
  ];

  readonly steps = [
    { title: 'Créez votre compte', text: 'Inscrivez-vous gratuitement avec votre email.' },
    { title: 'Renseignez votre profil', text: 'Indiquez votre filière, votre niveau et vos heures d’étude.' },
    { title: 'Suivez vos progrès', text: 'Mettez à jour votre maîtrise et repérez les chapitres à revoir.' },
  ];
}