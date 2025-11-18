import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvoiceService } from '../../../services/invoice';
import { Invoice } from '../../../models/invoice';

@Component({
  selector: 'app-invoice-edit',
  imports: [FormsModule,CommonModule,RouterLink],
  templateUrl: './invoice-edit.html',
  styleUrl: './invoice-edit.css',
})
export class InvoiceEdit implements OnInit{
  invoice?: Invoice;
  loading = false;
  saving = false;
  error?: string;
  constructor(private route:ActivatedRoute,private invoiceService:InvoiceService,private router:Router){}

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
        this.error = 'Failed to load invoice';
        this.loading = false;
      },
    });
  }

  addItem(): void {
    this.invoice?.items.push({ description: '', quantity: 1, unitPrice: 0 });
  }

  removeItem(index: number): void {
    if (this.invoice?.items.length! > 1) {
      this.invoice?.items.splice(index, 1);
    }
  }

  calcSubtotal(): number {
    return this.invoice?.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0,
    ) || 0;
  }

  calcTotal(): number {
    return this.calcSubtotal() + (Number(this.invoice?.taxAmount) || 0);
  }

  onSubmit(form:any){
    if (!form.valid || !this.invoice || !this.invoice.id) {
      this.error = 'Please fix validation errors before submitting.';
      return;
    }
    this.saving = true;
    this.error = undefined;

    // Clean items to only include fields that the backend expects (exclude id, totalPrice, invoiceId)
    // Also ensure quantity and unitPrice are proper numbers with correct constraints
    const cleanedItems = this.invoice.items.map(item => ({
      description: item.description,
      quantity: Math.max(1, Number(item.quantity) || 1),
      unitPrice: Math.max(0.01, Number(item.unitPrice) || 0.01),
    }));

    // Only send fields that the backend expects (exclude calculated fields)
    // Ensure taxAmount is a number and >= 0
    const payload = {
      clientName: this.invoice.clientName,
      clientAddress: this.invoice.clientAddress,
      clientEmail: this.invoice.clientEmail,
      clientPhone: this.invoice.clientPhone,
      issueDate: this.invoice.issueDate,
      dueDate: this.invoice.dueDate,
      taxAmount: Math.max(0, Number(this.invoice.taxAmount) || 0),
      items: cleanedItems,
    };

    this.invoiceService.update(this.invoice.id, payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.router.navigate(['/invoices', this.invoice!.id]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update invoice.';
        this.saving = false;
      },
    });
  }

}
