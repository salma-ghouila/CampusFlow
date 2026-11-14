import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './auth.service';

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  program: string | null;
  level: string | null;
  weeklyStudyHours: number;
  availability: string;
}

export type ProfileUpdate = Partial<
  Pick<Profile, 'fullName' | 'program' | 'level' | 'weeklyStudyHours' | 'availability'>
>;

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  getMe() {
    return this.http.get<Profile>(`${API_URL}/auth/me`);
  }

  update(data: ProfileUpdate) {
    return this.http.patch<Profile>(`${API_URL}/users/me`, data);
  }
}