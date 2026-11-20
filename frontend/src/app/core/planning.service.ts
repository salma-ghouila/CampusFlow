import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface Session {
  id: number;
  title: string;
  subject: string;
  day: number; // 0 = Lundi ... 6 = Dimanche
  time: string; // ex : "14:00"
  ai: boolean; // séance générée par l'assistant IA
  done: boolean;
}

export interface Exam {
  id: number;
  subject: string;
  date: string; // ex : "12 nov"
  room: string;
}

/**
 * Service MOCK du planning : données en mémoire.
 * À remplacer par HttpClient quand le backend existera.
 */
@Injectable({ providedIn: 'root' })
export class PlanningService {
  private nextId = 6;
  private sessions: Session[] = [
    { id: 1, title: 'Révision – Arbres', subject: 'Algorithmique', day: 0, time: '09:00', ai: false, done: false },
    { id: 2, title: 'Quiz personnalisé SQL', subject: 'Bases de données', day: 1, time: '14:00', ai: true, done: false },
    { id: 3, title: 'Révision Routage', subject: 'Réseaux', day: 2, time: '10:00', ai: true, done: false },
    { id: 4, title: 'Exercices Maths', subject: 'Mathématiques', day: 3, time: '09:00', ai: false, done: false },
    { id: 5, title: 'Réunion groupe RS-Team', subject: 'Réseaux', day: 4, time: '17:30', ai: false, done: false },
  ];
  private exams: Exam[] = [
    { id: 1, subject: 'Algorithmique', date: '12 nov', room: 'Salle B12 · 09:00' },
    { id: 2, subject: 'Bases de données', date: '18 nov', room: 'Salle A03 · 14:00' },
  ];

  private reply<T>(value: T, ms = 300): Observable<T> {
    return of(value).pipe(delay(ms));
  }

  getSessions(): Observable<Session[]> {
    return this.reply(this.sessions.map((s) => ({ ...s })), 600);
  }

  getExams(): Observable<Exam[]> {
    return this.reply(this.exams.map((e) => ({ ...e })), 600);
  }

  addSession(title: string, subject: string, day: number, time: string): Observable<Session> {
    const session: Session = { id: this.nextId++, title, subject, day, time, ai: false, done: false };
    this.sessions = [...this.sessions, session];
    return this.reply({ ...session });
  }

  toggleDone(id: number): Observable<Session> {
    this.sessions = this.sessions.map((s) => (s.id === id ? { ...s, done: !s.done } : s));
    return this.reply({ ...this.sessions.find((s) => s.id === id)! }, 150);
  }

  removeSession(id: number): Observable<void> {
    this.sessions = this.sessions.filter((s) => s.id !== id);
    return this.reply(undefined, 150);
  }
}