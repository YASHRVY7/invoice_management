import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../../shared/constants/api.constants';

export interface InvoicePdfOptions {
  fromName?: string;
  fromAddress?: string;
  fromEmail?: string;
  extraDetails?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(private http: HttpClient) {}

  generateInvoicePdf(invoiceId: number, options?: InvoicePdfOptions): Observable<Blob> {
    const payload = options ?? {};
    return this.http.post(`${API.BASE}/pdf/invoice/${invoiceId}`, payload, {
      responseType: 'blob',
    });
  }
}
