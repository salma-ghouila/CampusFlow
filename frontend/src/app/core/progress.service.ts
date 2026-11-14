import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './auth.service';

export interface Progress {
  chapterId: string;
  mastery: number;
  notes: string | null;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);

  getMine() {
    return this.http.get<Progress[]>(`${API_URL}/progress`);
  }

  update(chapterId: string, mastery: number) {
    return this.http.put<Progress>(`${API_URL}/progress/${chapterId}`, { mastery });
  }
}