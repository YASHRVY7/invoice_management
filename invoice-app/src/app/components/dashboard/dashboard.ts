import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../services/invoice';
import { Invoice, InvoiceStatistics } from '../../models/invoice';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { forkJoin } from 'rxjs';
import { Chart } from './chart/chart/chart';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink,DatePipe,CommonModule,Chart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  stats?: InvoiceStatistics;
  recentInvoices: Invoice[] = [];
  loading = false;
  error = '';
  username: string | null = null;

  constructor(private invoiceService: InvoiceService, private auth: Auth) { }

  ngOnInit(): void {
    this.username = this.auth.getUsername();
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';

    forkJoin({
      stats: this.invoiceService.stats(),
      invoices: this.invoiceService.list(1, 5),
    }).subscribe({
      next: ({ stats, invoices }) => {
        this.stats = stats.data;
        this.recentInvoices = invoices.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      },
    });
  }

  toggleStatus(invoice: Invoice) {
    if (!invoice?.id) return;
    
    const newStatus = invoice.status === 'paid' ? 'unpaid' : 'paid';
    
    this.invoiceService.updateStatus(invoice.id, newStatus).subscribe({
      next: () => {
        // Update the local invoice status immediately
        invoice.status = newStatus;
        // Reload data to update statistics
        this.loadData();
      },
      error: () => {
        this.error = 'Failed to update invoice status';
      },
    });
  }
}