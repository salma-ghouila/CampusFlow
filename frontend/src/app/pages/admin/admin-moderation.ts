import { Component, inject, signal } from '@angular/core';
import { AdminMockService, PendingResource } from '../../core/admin-mock.service';
import { EmptyState } from '../../shared/components/empty-state';
import { PageHeader } from '../../shared/components/page-header';
import { Skeleton } from '../../shared/components/skeleton';

@Component({
  selector: 'app-admin-moderation',
  imports: [PageHeader, Skeleton, EmptyState],
  template: `
    <app-page-header
      title="Modération des ressources"
      subtitle="Approuve ou rejette les contenus."
    />

    @if (loading()) {
      <app-skeleton height="160px" />
    } @else if (items().length === 0) {
      <app-empty-state icon="✅" title="Tout est à jour" message="Aucune ressource à examiner." />
    } @else {
      <div class="list">
        @for (p of items(); track p.id) {
          <article class="item">
            <div>
              <strong>{{ p.title }}</strong>
              <small>par {{ p.author }} · {{ p.reason }}</small>
            </div>
            <div class="actions">
              <button type="button" class="ok" (click)="decide(p)">Approuver</button>
              <button type="button" class="ko" (click)="decide(p)">Rejeter</button>
            </div>
          </article>
        }
      </div>
    }
  `,
  styles: `
    .list {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }
    .item {
      background: #fff;
      padding: 1rem 1.2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .item div:first-child {
      display: flex;
      flex-direction: column;
    }
    small {
      color: #6b7280;
    }
    .actions {
      display: flex;
      gap: 0.5rem;
    }
    button {
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid;
      background: #fff;
    }
    .ok {
      background: #6d28d9;
      color: #fff;
      border-color: transparent;
    }
    .ok:hover {
      background: #5b21b6;
    }
    .ko {
      color: #b91c1c;
      border-color: #fecaca;
    }
    .ko:hover {
      background: #fef2f2;
    }
    button:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px #ddd6fe;
    }
  `,
})
export class AdminModeration {
  private readonly service = inject(AdminMockService);

  readonly items = signal<PendingResource[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.service.getPending().subscribe((list) => {
      this.items.set(list);
      this.loading.set(false);
    });
  }

  decide(p: PendingResource) {
    this.service
      .decide(p.id)
      .subscribe(() => this.items.update((list) => list.filter((x) => x.id !== p.id)));
  }
}
