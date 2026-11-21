import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AdminService, AdminUser } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { PageHeader } from '../../shared/components/page-header';
import { Skeleton } from '../../shared/components/skeleton';

@Component({
  selector: 'app-admin-users',
  imports: [DatePipe, PageHeader, Skeleton],
  template: `
    <app-page-header title="Gestion des utilisateurs" subtitle="Comptes, rôles et statuts." />

    @if (loading()) {
      <app-skeleton height="200px" />
    } @else if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else {
      @if (actionError()) {
        <p class="error" role="alert">{{ actionError() }}</p>
      }
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Inscrit le</th>
              <th><span class="sr">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr>
                <td>
                  <strong>{{ u.fullName }}</strong>
                </td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="tag" [class.admin]="u.role === 'ADMIN'">{{
                    u.role === 'ADMIN' ? 'Admin' : 'Étudiant'
                  }}</span>
                </td>
                <td>
                  <span class="status" [attr.data-s]="u.status">{{ label(u.status) }}</span>
                </td>
                <td>{{ u.createdAt | date: 'dd/MM/yyyy' }}</td>
                <td class="right">
                  @if (u.id !== auth.user()?.id) {
                    @if (u.status === 'SUSPENDED') {
                      <button class="btn ok" (click)="toggle(u)">Réactiver</button>
                    } @else {
                      <button class="btn danger" (click)="toggle(u)">Suspendre</button>
                    }
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: `
    .table-wrap {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      text-align: left;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #6b7280;
      padding: 0.9rem 1rem;
      border-bottom: 1px solid #f3f4f6;
    }
    td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f3f4f6;
      font-size: 0.92rem;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .right {
      text-align: right;
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
    .tag {
      background: #f3f4f6;
      color: #374151;
      padding: 0.15rem 0.6rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .tag.admin {
      background: #ede9fe;
      color: #6d28d9;
    }
    .status {
      padding: 0.15rem 0.6rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .status[data-s='ACTIVE'] {
      background: #dcfce7;
      color: #15803d;
    }
    .status[data-s='PENDING'] {
      background: #fef9c3;
      color: #a16207;
    }
    .status[data-s='SUSPENDED'] {
      background: #fee2e2;
      color: #b91c1c;
    }
    .btn {
      border: 1px solid;
      background: #fff;
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      font: inherit;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .btn.danger {
      color: #b91c1c;
      border-color: #fecaca;
    }
    .btn.danger:hover {
      background: #fef2f2;
    }
    .btn.ok {
      color: #15803d;
      border-color: #bbf7d0;
    }
    .btn.ok:hover {
      background: #f0fdf4;
    }
    .error {
      color: #dc2626;
    }
  `,
})
export class AdminUsers {
  readonly auth = inject(AuthService);
  private readonly service = inject(AdminService);

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly actionError = signal('');

  constructor() {
    this.service.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les utilisateurs');
        this.loading.set(false);
      },
    });
  }

  label(status: AdminUser['status']) {
    return { ACTIVE: 'Actif', PENDING: 'En attente', SUSPENDED: 'Suspendu' }[status];
  }

  toggle(user: AdminUser) {
    const next = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    this.actionError.set('');
    this.service.setStatus(user.id, next).subscribe({
      next: (updated) =>
        this.users.update((list) =>
          list.map((u) => (u.id === user.id ? { ...u, status: updated.status } : u)),
        ),
      error: () => this.actionError.set('Impossible de modifier le statut'),
    });
  }
}
