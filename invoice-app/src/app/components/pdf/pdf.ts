import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfService, InvoicePdfOptions } from '../../services/pdf/pdf';

@Component({
  selector: 'app-pdf',
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf.html',
  styleUrl: './pdf.css',
})
export class Pdf {
  @Input() invoiceId!: number;

  showForm = false;
  downloading = false;
  error?: string;

  formData: InvoicePdfOptions = {
    fromName: '',
    fromAddress: '',
    fromEmail: '',
    extraDetails: '',
  };

  constructor(private pdfService: PdfService) {}

  openForm(): void {
    this.showForm = true;
    this.error = undefined;
  }

  closeForm(): void {
    if (this.downloading) {
      return;
    }
    this.showForm = false;
  }

  submitAndDownload(): void {
    if (!this.invoiceId) {
      this.error = 'Invoice not ready for download.';
      return;
    }

    this.downloading = true;
    this.error = undefined;
    this.pdfService.generateInvoicePdf(this.invoiceId, this.formData).subscribe({
      next: (blob) => {
        this.saveBlob(blob);
        this.downloading = false;
        this.showForm = false;
      },
      error: () => {
        this.error = 'Unable to download invoice. Please try again.';
        this.downloading = false;
      },
    });
  }

  private saveBlob(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${this.invoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}
