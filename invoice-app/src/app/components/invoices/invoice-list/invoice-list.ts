import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Invoice } from '../../../models/invoice';
import { InvoiceService } from '../../../services/invoice';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-invoice-list',
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.css',
})
export class InvoiceList implements OnInit {
  invoices: Invoice[] = [];
  loading = false;
  error?: string;

  page = 1;
  limit = 10;
  clientName = '';
  status = '';

  totalPages = 1;
  totalItems = 0;

  constructor(private invoiceService: InvoiceService, private router: Router) { }

  ngOnInit(): void {
    this.fetchInvoices();
  }

  fetchInvoices(): void {
    this.loading = true;
    this.error = undefined;


    this.invoiceService.list(this.page, this.limit, this.status || undefined, this.clientName || undefined).subscribe({
      next: (res) => {
        this.invoices = res.data;
        this.totalPages = res.pagination.totalPages;
        this.totalItems = res.pagination.totalItems;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load invoices';
        this.loading = false;
      },
    })
  }
  resetFilters(): void {
    this.clientName = '';
    this.status = '';
    this.page = 1;
    this.fetchInvoices();
  }

  toggleStatus(inv: Invoice): void {
    const newStatus = inv.status === 'paid' ? 'unpaid' : 'paid';
    this.invoiceService.updateStatus(inv.id!, newStatus).subscribe({
      next: (res) => {
        inv.status = res.data.status;
      },
      error: () => {
        this.error = 'Failed to update status';
      }
    });
  }

  deleteInvoice(inv: Invoice): void {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    this.invoiceService.remove(inv.id!).subscribe({
      next: () => {
        this.fetchInvoices();
      },
      error: () => {
        this.error = 'Failed to delete invoice';
      }
    });
  }
  setPage(page: number): void {
    this.page = page;
    this.fetchInvoices();
  }
}
