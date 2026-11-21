import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface Group {
  id: number;
  name: string;
  subject: string;
  members: number;
  joined: boolean; // true si je suis membre
}

/**
 * Service MOCK des groupes d'étude : données en mémoire.
 * À remplacer par HttpClient quand le backend existera.
 */
@Injectable({ providedIn: 'root' })
export class GroupsService {
  private nextId = 5;
  private data: Group[] = [
    { id: 1, name: 'RS-Team', subject: 'Réseaux', members: 6, joined: true },
    { id: 2, name: 'SQL Masters', subject: 'Bases de données', members: 9, joined: true },
    { id: 3, name: 'Algo Lovers', subject: 'Algorithmique', members: 12, joined: false },
    { id: 4, name: 'Maths L2', subject: 'Mathématiques', members: 15, joined: false },
  ];

  private reply<T>(value: T, ms = 300): Observable<T> {
    return of(value).pipe(delay(ms));
  }

  getAll(): Observable<Group[]> {
    return this.reply(
      this.data.map((g) => ({ ...g })),
      600,
    );
  }

  create(name: string, subject: string): Observable<Group> {
    const group: Group = { id: this.nextId++, name, subject, members: 1, joined: true };
    this.data = [group, ...this.data];
    return this.reply({ ...group });
  }

  /** Rejoint ou quitte un groupe. */
  toggleJoin(id: number): Observable<Group> {
    this.data = this.data.map((g) =>
      g.id === id ? { ...g, joined: !g.joined, members: g.members + (g.joined ? -1 : 1) } : g,
    );
    return this.reply({ ...this.data.find((g) => g.id === id)! }, 150);
  }
}
