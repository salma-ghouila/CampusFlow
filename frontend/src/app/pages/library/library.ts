import { Component, computed, inject, signal } from '@angular/core';
import { Resource, ResourcesService } from '../../core/resources.service';

type Tab = 'all' | 'favorites' | 'mine';

@Component({
  selector: 'app-library',
  template: `
    <header class="head">
      <h1>Bibliothèque de ressources</h1>
      <p>Découvre, partage et note les ressources de la communauté.</p>
    </header>

    <section class="upload" aria-label="Déposer une ressource">
      <input #title placeholder="Titre de la ressource" aria-label="Titre de la ressource"
             (keyup.enter)="add(title, subject)" />
      <select #subject aria-label="Matière">
        @for (s of subjectsList; track s) {
          <option [value]="s">{{ s }}</option>
        }
      </select>
      <button type="button" (click)="add(title, subject)">+ Déposer</button>
    </section>

    <section class="toolbar">
      <input #q type="search" class="search" placeholder="Rechercher par titre, auteur, matière..."
             aria-label="Rechercher une ressource" (input)="query.set(q.value)" />
      <div class="tabs" role="group" aria-label="Filtres">
        @for (t of tabs; track t.value) {
          <button type="button" class="tab" [class.active]="tab() === t.value"
                  [attr.aria-pressed]="tab() === t.value" (click)="tab.set(t.value)">
            {{ t.label }}
          </button>
        }
      </div>
    </section>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }

    @if (loading()) {
      <div class="list" aria-busy="true" aria-label="Chargement">
        @for (i of [1, 2, 3, 4]; track i) {
          <div class="skeleton"></div>
        }
      </div>
    } @else if (filtered().length === 0) {
      <div class="empty">
        <div class="empty-ico">📚</div>
        <h3>Aucune ressource trouvée</h3>
        <p>Essaie un autre filtre ou dépose la première ressource.</p>
      </div>
    } @else {
      <div class="list">
        @for (r of filtered(); track r.id) {
          <article class="item">
            <div class="info">
              <h3>{{ r.title }}</h3>
              <p class="meta">
                <span class="badge">{{ r.subject }}</span>
                par {{ r.author }} · {{ r.downloads }} téléchargements
              </p>
              <div class="stars" role="group" [attr.aria-label]="'Noter ' + r.title">
                @for (n of stars; track n) {
                  <button type="button" class="star" [class.on]="n <= r.rating"
                          [attr.aria-label]="'Donner ' + n + ' sur 5'" (click)="rate(r, n)">★</button>
                }
                <span class="score">{{ r.votes ? r.rating : 'Pas encore noté' }}</span>
              </div>
            </div>
            <div class="actions">
              <button type="button" class="ghost" [attr.aria-pressed]="r.favorite"
                      [attr.aria-label]="r.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                      (click)="toggleFavorite(r)">{{ r.favorite ? '♥' : '♡' }}</button>
              <button type="button" class="primary" (click)="download(r)">⬇ Télécharger</button>
            </div>
          </article>
        }
      </div>
    }
  `,
  styles: `
    .head h1 { margin: 0; }
    .head p { color: #6b7280; margin: 0.3rem 0 1.4rem; }
    input, select { padding: 0.7rem 0.9rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font: inherit; background: #fff; }
    input:focus, select:focus, button:focus-visible { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px #e0e7ff; }
    .upload { display: flex; gap: 0.6rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .upload input { flex: 1; min-width: 200px; }
    .primary, .upload button { padding: 0.7rem 1.1rem; border: none; border-radius: 10px; background: #4f46e5; color: #fff; font: inherit; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .primary:hover, .upload button:hover { background: #4338ca; }
    .toolbar { display: flex; gap: 0.8rem; margin-bottom: 1.2rem; flex-wrap: wrap; align-items: center; }
    .search { flex: 1; min-width: 220px; }
    .tabs { display: flex; gap: 0.4rem; }
    .tab { border: 1.5px solid #e5e7eb; background: #fff; padding: 0.45rem 0.9rem; border-radius: 999px; font: inherit; cursor: pointer; }
    .tab.active { background: #4f46e5; color: #fff; border-color: transparent; }
    .list { display: flex; flex-direction: column; gap: 0.8rem; }
    .item { background: #fff; padding: 1.1rem 1.2rem; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; justify-content: space-between; gap: 1rem; align-items: center; flex-wrap: wrap; transition: transform 0.15s; }
    .item:hover { transform: translateY(-2px); }
    .item h3 { margin: 0 0 0.3rem; }
    .meta { margin: 0 0 0.4rem; color: #6b7280; font-size: 0.9rem; }
    .badge { background: #eef2ff; color: #4f46e5; padding: 0.1rem 0.6rem; border-radius: 999px; font-weight: 600; font-size: 0.8rem; margin-right: 0.3rem; }
    .stars { display: flex; align-items: center; gap: 0.1rem; }
    .star { border: none; background: none; font-size: 1.2rem; color: #d1d5db; cursor: pointer; padding: 0 0.1rem; }
    .star.on { color: #f59e0b; }
    .score { margin-left: 0.5rem; color: #6b7280; font-size: 0.85rem; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .ghost { border: 1.5px solid #e5e7eb; background: #fff; border-radius: 10px; padding: 0.6rem 0.8rem; font-size: 1.1rem; cursor: pointer; color: #ef4444; }
    .skeleton { height: 96px; border-radius: 14px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
    @keyframes shimmer { to { background-position: -200% 0; } }
    .empty { background: #fff; border: 2px dashed #c7d2fe; border-radius: 16px; padding: 3rem 1rem; text-align: center; }
    .empty-ico { font-size: 2.8rem; }
    .empty p { color: #6b7280; margin: 0; }
    .error { color: #dc2626; }
    @media (max-width: 600px) { .actions { width: 100%; justify-content: space-between; } }
  `,
})
export class Library {
  private readonly service = inject(ResourcesService);

  readonly subjectsList = ['Algorithmique', 'Bases de données', 'Réseaux', 'Mathématiques', 'Anglais technique'];
  readonly stars = [1, 2, 3, 4, 5];
  readonly tabs: { value: Tab; label: string }[] = [
    { value: 'all', label: 'Toutes' },
    { value: 'favorites', label: 'Mes favoris' },
    { value: 'mine', label: 'Mes dépôts' },
  ];

  readonly resources = signal<Resource[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly query = signal('');
  readonly tab = signal<Tab>('all');

  /** Liste affichée : applique l'onglet puis la recherche. */
  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.resources().filter((r) => {
      if (this.tab() === 'favorites' && !r.favorite) return false;
      if (this.tab() === 'mine' && !r.mine) return false;
      return !q || `${r.title} ${r.author} ${r.subject}`.toLowerCase().includes(q);
    });
  });

  constructor() {
    this.service.getAll().subscribe({
      next: (list) => {
        this.resources.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les ressources');
        this.loading.set(false);
      },
    });
  }

  add(title: HTMLInputElement, subject: HTMLSelectElement) {
    const value = title.value.trim();
    if (value.length < 2) return;
    this.service.create(value, subject.value).subscribe((r) => {
      this.resources.update((list) => [r, ...list]);
      title.value = '';
    });
  }

  rate(r: Resource, value: number) {
    this.service.rate(r.id, value).subscribe((u) => this.replace(u));
  }

  toggleFavorite(r: Resource) {
    this.service.toggleFavorite(r.id).subscribe((u) => this.replace(u));
  }

  download(r: Resource) {
    this.service.download(r.id).subscribe((u) => this.replace(u));
  }

  private replace(updated: Resource) {
    this.resources.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
  }
}