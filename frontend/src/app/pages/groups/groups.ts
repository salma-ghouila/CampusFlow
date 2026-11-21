import { Component, computed, inject, signal } from '@angular/core';
import { Group, GroupsService } from '../../core/groups.service';
import { EmptyState } from '../../shared/components/empty-state';
import { PageHeader } from '../../shared/components/page-header';
import { Skeleton } from '../../shared/components/skeleton';

type Tab = 'all' | 'mine';

@Component({
  selector: 'app-groups',
  imports: [PageHeader, Skeleton, EmptyState],
  template: `
    <app-page-header title="Groupes d'étude" subtitle="Révise avec d'autres étudiants." />

    <section class="create" aria-label="Créer un groupe">
      <input
        #name
        placeholder="Nom du groupe"
        aria-label="Nom du groupe"
        (keyup.enter)="add(name, subject)"
      />
      <select #subject aria-label="Matière">
        @for (s of subjectsList; track s) {
          <option [value]="s">{{ s }}</option>
        }
      </select>
      <button type="button" (click)="add(name, subject)">+ Créer un groupe</button>
    </section>

    <div class="tabs" role="group" aria-label="Filtres">
      @for (t of tabs; track t.value) {
        <button
          type="button"
          class="tab"
          [class.active]="tab() === t.value"
          [attr.aria-pressed]="tab() === t.value"
          (click)="tab.set(t.value)"
        >
          {{ t.label }}
        </button>
      }
    </div>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }

    @if (loading()) {
      <div class="grid" aria-busy="true" aria-label="Chargement">
        @for (i of [1, 2, 3, 4]; track i) {
          <app-skeleton height="150px" />
        }
      </div>
    } @else if (filtered().length === 0) {
      <app-empty-state
       icon="👥"
       title="Aucun groupe"
       message="Crée ton premier groupe ou rejoins-en un."
      />
    } @else {
      <div class="grid">
        @for (g of filtered(); track g.id) {
          <article class="card">
            <h3>{{ g.name }}</h3>
            <p class="meta">
              <span class="badge">{{ g.subject }}</span>
              {{ g.members }} membre{{ g.members > 1 ? 's' : '' }}
            </p>
            <button
              type="button"
              [class.leave]="g.joined"
              [class.join]="!g.joined"
              (click)="toggle(g)"
            >
              {{ g.joined ? 'Quitter' : 'Rejoindre' }}
            </button>
          </article>
        }
      </div>
    }
  `,
  styles: `
    
    input,
    select {
      padding: 0.7rem 0.9rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      font: inherit;
      background: #fff;
    }
    input:focus,
    select:focus,
    button:focus-visible {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px #e0e7ff;
    }
    .create {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .create input {
      flex: 1;
      min-width: 200px;
    }
    .create button {
      padding: 0.7rem 1.1rem;
      border: none;
      border-radius: 10px;
      background: #4f46e5;
      color: #fff;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .create button:hover {
      background: #4338ca;
    }
    .tabs {
      display: flex;
      gap: 0.4rem;
      margin-bottom: 1.2rem;
    }
    .tab {
      border: 1.5px solid #e5e7eb;
      background: #fff;
      padding: 0.45rem 0.9rem;
      border-radius: 999px;
      font: inherit;
      cursor: pointer;
    }
    .tab.active {
      background: #4f46e5;
      color: #fff;
      border-color: transparent;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }
    .card {
      background: #fff;
      padding: 1.2rem;
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      transition: transform 0.15s;
    }
    .card:hover {
      transform: translateY(-2px);
    }
    .card h3 {
      margin: 0;
    }
    .meta {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      align-items: flex-start;
    }
    .badge {
      background: #eef2ff;
      color: #4f46e5;
      padding: 0.1rem 0.6rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.8rem;
    }
    .join,
    .leave {
      padding: 0.55rem;
      border-radius: 10px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .join {
      border: none;
      background: #4f46e5;
      color: #fff;
    }
    .join:hover {
      background: #4338ca;
    }
    .leave {
      border: 1.5px solid #e5e7eb;
      background: #fff;
      color: #374151;
    }
    .leave:hover {
      background: #fee2e2;
    }
    
    .error {
      color: #dc2626;
    }
  `,
})
export class Groups {
  private readonly service = inject(GroupsService);

  readonly subjectsList = [
    'Algorithmique',
    'Bases de données',
    'Réseaux',
    'Mathématiques',
    'Anglais technique',
  ];
  readonly tabs: { value: Tab; label: string }[] = [
    { value: 'all', label: 'Tous les groupes' },
    { value: 'mine', label: 'Mes groupes' },
  ];

  readonly groups = signal<Group[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly tab = signal<Tab>('all');

  readonly filtered = computed(() => this.groups().filter((g) => this.tab() === 'all' || g.joined));

  constructor() {
    this.service.getAll().subscribe({
      next: (list) => {
        this.groups.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les groupes');
        this.loading.set(false);
      },
    });
  }

  add(name: HTMLInputElement, subject: HTMLSelectElement) {
    const value = name.value.trim();
    if (value.length < 2) return;
    this.service.create(value, subject.value).subscribe((g) => {
      this.groups.update((list) => [g, ...list]);
      name.value = '';
    });
  }

  toggle(g: Group) {
    this.service
      .toggleJoin(g.id)
      .subscribe((u) => this.groups.update((list) => list.map((x) => (x.id === u.id ? u : x))));
  }
}
