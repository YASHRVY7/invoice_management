import { Injectable } from '@angular/core';
import { API } from '../../shared/constants/api.constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Chart {
  constructor(private http: HttpClient) { }
  statsWithPeriod(period: 'day' | 'week' | 'month' | 'year') {
    return this.http.get<{ success: boolean; data: { labels: string[]; values: number[] } }>(
      `${API.BASE}/chart/income?period=${period}`
    );
  }
}
