import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './auth.service';

export interface Chapter {
  id: string;
  title: string;
  order: number;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<Subject[]>(`${API_URL}/subjects`);
  }

  create(name: string) {
    return this.http.post<Subject>(`${API_URL}/subjects`, { name });
  }

  remove(id: string) {
    return this.http.delete(`${API_URL}/subjects/${id}`);
  }

  addChapter(subjectId: string, title: string) {
    return this.http.post<Chapter>(`${API_URL}/subjects/${subjectId}/chapters`, { title });
  }

  removeChapter(subjectId: string, chapterId: string) {
    return this.http.delete(`${API_URL}/subjects/${subjectId}/chapters/${chapterId}`);
  }
}