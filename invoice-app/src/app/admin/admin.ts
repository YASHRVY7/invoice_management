import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../shared/constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get<any>(`${API.BASE}/admin/users`);
  }
  getLogs() {
    return this.http.get<{ logs: any[] }>(`${API.BASE}/admin/logs`);
  }

  removeUser(userId: number) {
    return this.http.delete(`${API.BASE}/admin/users/${userId}`);
  }
}
