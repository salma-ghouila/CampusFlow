import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './auth.service';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  program: string | null;
  level: string | null;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  subjects: number;
  chapters: number;
  suspended: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  getStats() {
    return this.http.get<AdminStats>(`${API_URL}/admin/stats`);
  }

  getUsers() {
    return this.http.get<AdminUser[]>(`${API_URL}/admin/users`);
  }

  setStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
    return this.http.patch<AdminUser>(`${API_URL}/admin/users/${id}/status`, { status });
  }
}