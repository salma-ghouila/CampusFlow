import { Component, inject, signal } from '@angular/core';
import { AdminService, AdminStats } from '../../core/admin.service';
import { PageHeader } from '../../shared/components/page-header';
import { Skeleton } from '../../shared/components/skeleton';
import { StatCard } from '../../shared/components/stat-card';

@Component({
  selector: 'app-admin-dashboard',
  imports: [PageHeader, Skeleton, StatCard],
  template: `
    <app-page-header title="Administration" subtitle="Vue d'ensemble de la plateforme." />

    @if (loading()) {
      <app-skeleton height="90px" />
    } @else if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (stats(); as s) {
      <div class="stats">
        <app-stat-card label="Utilisateurs" [value]="s.users" />
        <app-stat-card label="Matières créées" [value]="s.subjects" />
        <app-stat-card label="Chapitres" [value]="s.chapters" />
        <app-stat-card label="Comptes suspendus" [value]="s.suspended" />
      </div>
    }
  `,
  styles: `
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }
    .error {
      color: #dc2626;
    }
  `,
})
export class AdminDashboard {
  private readonly service = inject(AdminService);

  readonly stats = signal<AdminStats | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.service.getStats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les statistiques');
        this.loading.set(false);
      },
    });
  }
}
