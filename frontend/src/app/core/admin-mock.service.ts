import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface PendingResource {
  id: number;
  title: string;
  author: string;
  reason: string;
}

export interface AiConfig {
  questionsPerQuiz: number;
  defaultDifficulty: 'Facile' | 'Adaptative' | 'Difficile';
  masteryThreshold: number;
  weakThreshold: number;
}

/** Service MOCK de l'espace admin (le backend n'a pas encore ces modules). */
@Injectable({ providedIn: 'root' })
export class AdminMockService {
  private pending: PendingResource[] = [
    { id: 1, title: 'TD SQL – version 2', author: 'Hatem R.', reason: 'Signalement : doublon' },
    { id: 2, title: 'Cours Réseaux Ch.5', author: 'Amel K.', reason: 'Nouveau dépôt' },
    { id: 3, title: 'Résumé Maths', author: 'Yassine M.', reason: 'Nouveau dépôt' },
  ];

  private config: AiConfig = {
    questionsPerQuiz: 10,
    defaultDifficulty: 'Adaptative',
    masteryThreshold: 75,
    weakThreshold: 50,
  };

  getPending(): Observable<PendingResource[]> {
    return of(this.pending.map((p) => ({ ...p }))).pipe(delay(600));
  }

  decide(id: number): Observable<void> {
    this.pending = this.pending.filter((p) => p.id !== id);
    return of(undefined).pipe(delay(200));
  }

  getConfig(): Observable<AiConfig> {
    return of({ ...this.config }).pipe(delay(500));
  }

  saveConfig(config: AiConfig): Observable<AiConfig> {
    this.config = { ...config };
    return of({ ...this.config }).pipe(delay(300));
  }
}
