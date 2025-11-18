import { Injectable } from '@angular/core';
import { API } from '../shared/constants/api.constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { InvoiceStatistics, Invoice, ApiResponse, PaginatedInvoices } from '../models/invoice';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private base = API.BASE + API.INVOICES;

  constructor(private http: HttpClient) { }

  create(invoice: Invoice): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(this.base, invoice);
  }

  list(page = 1, limit = 10, status?: string, clientName?: string): Observable<PaginatedInvoices> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (status) params = params.set('status', status);
    if (clientName) params = params.set('clientName', clientName);
    return this.http.get<PaginatedInvoices>(this.base, { params });
  }

  get(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.base}/${id}`)
  }

  update(id: number, Invoice: Partial<Invoice>): Observable<ApiResponse<Invoice>> {
    return this.http.put<ApiResponse<Invoice>>(`${this.base}/${id}`, Invoice)
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<Invoice>> {
    return this.http.patch<ApiResponse<Invoice>>(`${this.base}/${id}/status`, { status })
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
  stats(): Observable<{ success: boolean; data: InvoiceStatistics }> {
    return this.http.get<{ success: boolean; data: InvoiceStatistics }>(API.BASE + API.STATS);
  }

}
