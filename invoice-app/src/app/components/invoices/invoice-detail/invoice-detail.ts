import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Invoice} from '../../../models/invoice';
import { InvoiceService } from '../../../services/invoice';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Pdf } from '../../pdf/pdf';

@Component({
  selector: 'app-invoice-detail',
  imports: [CommonModule, Pdf],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.css',
})
export class InvoiceDetail implements OnInit {
  invoice?: Invoice;
  loading = false;
  error?: string;

  constructor(private route: ActivatedRoute, private invoiceService: InvoiceService, private router: Router) {}

  ngOnInit(): void {
    this.loadInvoice();
  }

  loadInvoice(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Invalid invoice ID';
      return;
    }
    this.loading = true;
    this.invoiceService.get(id).subscribe({
      next: (res) => {
        this.invoice = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Invoice not found or could not be loaded';
        this.loading = false;
      },
    });
  }

  printInvoice(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }
}
