import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface Resource {
  id: number;
  title: string;
  subject: string;
  author: string;
  rating: number; // moyenne sur 5
  votes: number;
  downloads: number;
  favorite: boolean;
  mine: boolean;
}

/**
 * Service MOCK : simule une API de ressources en mémoire.
 * Quand le vrai backend existera, on remplacera seulement ce fichier
 * (mêmes méthodes, mais avec HttpClient) sans toucher à la page.
 */
@Injectable({ providedIn: 'root' })
export class ResourcesService {
  private nextId = 5;
  private data: Resource[] = [
    {
      id: 1,
      title: 'Résumé – Arbres binaires',
      subject: 'Algorithmique',
      author: 'Yassine M.',
      rating: 4.8,
      votes: 12,
      downloads: 54,
      favorite: false,
      mine: false,
    },
    {
      id: 2,
      title: 'TD corrigé SQL',
      subject: 'Bases de données',
      author: 'Amel K.',
      rating: 4.5,
      votes: 8,
      downloads: 31,
      favorite: true,
      mine: false,
    },
    {
      id: 3,
      title: 'Fiche modèle OSI',
      subject: 'Réseaux',
      author: 'Hatem R.',
      rating: 4.2,
      votes: 5,
      downloads: 22,
      favorite: false,
      mine: false,
    },
    {
      id: 4,
      title: 'Annales 2025',
      subject: 'Mathématiques',
      author: 'Équipe CampusFlow',
      rating: 4.9,
      votes: 20,
      downloads: 120,
      favorite: false,
      mine: false,
    },
  ];

  /** Simule un délai réseau pour pouvoir afficher l'état de chargement. */
  private reply<T>(value: T, ms = 400): Observable<T> {
    return of(value).pipe(delay(ms));
  }

  getAll(): Observable<Resource[]> {
    return this.reply(
      this.data.map((r) => ({ ...r })),
      700,
    );
  }

  create(title: string, subject: string): Observable<Resource> {
    const resource: Resource = {
      id: this.nextId++,
      title,
      subject,
      author: 'Moi',
      rating: 0,
      votes: 0,
      downloads: 0,
      favorite: false,
      mine: true,
    };
    this.data = [resource, ...this.data];
    return this.reply({ ...resource });
  }

  toggleFavorite(id: number): Observable<Resource> {
    return this.update(id, (r) => ({ ...r, favorite: !r.favorite }));
  }

  rate(id: number, value: number): Observable<Resource> {
    return this.update(id, (r) => ({
      ...r,
      rating: Math.round(((r.rating * r.votes + value) / (r.votes + 1)) * 10) / 10,
      votes: r.votes + 1,
    }));
  }

  download(id: number): Observable<Resource> {
    return this.update(id, (r) => ({ ...r, downloads: r.downloads + 1 }));
  }

  private update(id: number, change: (r: Resource) => Resource): Observable<Resource> {
    this.data = this.data.map((r) => (r.id === id ? change(r) : r));
    return this.reply({ ...this.data.find((r) => r.id === id)! }, 150);
  }
}
