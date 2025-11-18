import { Component } from '@angular/core';
import { Invoice } from '../../../models/invoice';
import { InvoiceItem } from '../../../models/invoice-item';
import { InvoiceService } from '../../../services/invoice';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-invoice-create',
  imports: [FormsModule, RouterLink,CommonModule],
  templateUrl: './invoice-create.html',
  styleUrl: './invoice-create.css',
})
export class InvoiceCreate {
  invoice: Invoice = {

    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate:'',
    taxAmount: 0,
    items: [{ description: '', quantity: 1, unitPrice: 0 } as InvoiceItem],
  }
  saving = false;
  error?: string;
  success?: string;

  constructor(private invoiceService:InvoiceService,private router:Router){}

  addItem(): void {
   
    this.invoice.items.push({ description: '', quantity: 1, unitPrice: 0 });
  }

  removeItem(index: number): void {
    if (this.invoice.items.length > 1) this.invoice.items.splice(index, 1);
  }

  calcSubtotal(): number {
    return this.invoice.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0,
    );
  }
  calcTotal(): number {
    return this.calcSubtotal() + (Number(this.invoice.taxAmount) || 0);
  }

  onSubmit(form: any): void {
    if (!form.valid) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }
    this.saving = true;
    
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

    this.invoiceService.create(payload).subscribe({
      next: (res) => {
        this.success = 'Invoice created successfully!';
        this.error = '';
        this.saving = false;
        this.router.navigate(['/invoices', res.data.id]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create invoice.';
        this.success = '';
        this.saving = false;
      },
    });
  }
}