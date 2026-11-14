import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { ProfileService } from '../../core/profile.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Mon profil</h1>

    @if (loading()) {
      <p>Chargement...</p>
    } @else {
      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <label>Nom complet</label>
        <input type="text" formControlName="fullName" />

        <label>Email</label>
        <input type="email" [value]="email()" disabled />

        <label>Filière</label>
        <input type="text" formControlName="program" placeholder="Informatique" />

        <label>Niveau</label>
        <select formControlName="level">
          <option value="">Non précisé</option>
          <option>Licence 1</option>
          <option>Licence 2</option>
          <option>Licence 3</option>
          <option>Master 1</option>
          <option>Master 2</option>
        </select>

        <label>Heures d'étude par semaine</label>
        <input type="number" min="1" max="80" formControlName="weeklyStudyHours" />

        <label>Disponibilité</label>
        <select formControlName="availability">
          <option>Matin</option>
          <option>Après-midi</option>
          <option>Soir</option>
        </select>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        @if (success()) {
          <p class="success">Profil enregistré ✔</p>
        }

        <button type="submit" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </form>
    }
  `,
  styles: `
    h1 { margin-top: 0; }
    .card { background: #fff; padding: 1.5rem; border-radius: 12px; max-width: 460px; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
    label { font-size: 0.9rem; color: #374151; margin-top: 0.4rem; }
    input, select { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; font: inherit; }
    input:disabled { background: #f3f4f6; color: #6b7280; }
    button { margin-top: 1rem; padding: 0.7rem; border: none; border-radius: 8px; background: #4f46e5; color: #fff; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #dc2626; margin: 0; }
    .success { color: #16a34a; margin: 0; }
  `,
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  readonly email = signal('');

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    program: [''],
    level: [''],
    weeklyStudyHours: [10, [Validators.required, Validators.min(1), Validators.max(80)]],
    availability: ['Matin'],
  });

  constructor() {
    this.profileService.getMe().subscribe({
      next: (p) => {
        this.email.set(p.email);
        this.form.patchValue({
          fullName: p.fullName,
          program: p.program ?? '',
          level: p.level ?? '',
          weeklyStudyHours: p.weeklyStudyHours,
          availability: p.availability,
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le profil');
        this.loading.set(false);
      },
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    this.success.set(false);

    const v = this.form.getRawValue();
    this.profileService
      .update({
        fullName: v.fullName,
        program: v.program,
        level: v.level,
        weeklyStudyHours: Number(v.weeklyStudyHours),
        availability: v.availability,
      })
      .subscribe({
        next: (p) => {
          this.auth.updateStoredName(p.fullName);
          this.saving.set(false);
          this.success.set(true);
        },
        error: () => {
          this.saving.set(false);
          this.error.set("Impossible d'enregistrer le profil");
        },
      });
  }
}