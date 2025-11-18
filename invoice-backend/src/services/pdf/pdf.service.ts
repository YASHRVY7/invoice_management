import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import PDFDocument = require('pdfkit');
import { Invoice } from 'src/entities/invoice.entity';
import { InvoiceItem } from 'src/entities/invoice-item.entity';
import { InvoiceService } from '../invoice/invoice.service';
import { PdfCustomizationDto } from 'src/dto/pdf-customization.dto';

@Injectable()
export class PdfService {
  constructor(private readonly invoiceService: InvoiceService) {}

  async generateInvoicePdf(
    invoiceId: number,
    res: Response,
    customization?: PdfCustomizationDto,
  ): Promise<void> {
    const invoice: Invoice = await this.invoiceService.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const issueDate = this.formatDate(invoice.issueDate);
    const dueDate = this.formatDate(invoice.dueDate);
    const subtotal = this.formatMoney(invoice.subtotal);
    const taxAmount = this.formatMoney(invoice.taxAmount);
    const totalAmount = this.formatMoney(invoice.totalAmount);
    const items = (invoice.items ?? []).map((item) => this.normalizeItem(item));

    const fromName = this.fallbackText(customization?.fromName, 'Your Company Name');
    const fromAddressLines = this.splitLines(customization?.fromAddress, [
      'Street Address Line 1',
      'City, State, ZIP',
    ]);
    const fromEmail = customization?.fromEmail?.trim();
    const extraDetails = customization?.extraDetails?.trim();

    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`,
      );
      doc.pipe(res);

      // ===== Header / Company block =====
      doc
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .fontSize(24)
        .text('INVOICE', 50, 40);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text('Invoice Number:', 320, 40, { width: 230, align: 'right' })
        .fillColor('#111827')
        .text(invoice.invoiceNumber, 320, 55, { width: 230, align: 'right' })
        .fillColor('#4B5563')
        .text('Issue Date:', 320, 75, { width: 230, align: 'right' })
        .fillColor('#111827')
        .text(issueDate, 320, 90, { width: 230, align: 'right' })
        .fillColor('#4B5563')
        .text('Due Date:', 320, 110, { width: 230, align: 'right' })
        .fillColor('#111827')
        .text(dueDate, 320, 125, { width: 230, align: 'right' })
        .fillColor('#4B5563')
        .text('Status:', 320, 145, { width: 230, align: 'right' })
        .fillColor('#111827')
        .text(invoice.status?.toUpperCase() ?? 'N/A', 320, 160, {
          width: 230,
          align: 'right',
        });

      // Optional "From" (your business) block – adjustable via customization payload
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#111827')
        .text('From', 50, 80);
      doc.font('Helvetica').fontSize(10).fillColor('#4B5563');
      let fromLineY = 95;
      doc.text(fromName, 50, fromLineY, { width: 230 });
      fromLineY += 15;
      fromAddressLines.forEach((line) => {
        doc.text(line, 50, fromLineY, { width: 230 });
        fromLineY += 15;
      });
      if (fromEmail) {
        doc.text(`Email: ${fromEmail}`, 50, fromLineY, { width: 230 });
        fromLineY += 15;
      }

      // ===== Bill To block =====
      const billToTop = Math.max(fromLineY + 25, 180);
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#111827')
        .text('Bill To', 50, billToTop);

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#111827')
        .text(invoice.clientName ?? '', 50, billToTop + 15);

      doc.fillColor('#4B5563');
      let lineOffset = billToTop + 30;
      if (invoice.clientAddress) {
        doc.text(invoice.clientAddress, 50, lineOffset);
        lineOffset += 15;
      }
      if (invoice.clientEmail) {
        doc.text(invoice.clientEmail, 50, lineOffset);
        lineOffset += 15;
      }
      if (invoice.clientPhone) {
        doc.text(invoice.clientPhone, 50, lineOffset);
        lineOffset += 15;
      }

      // ===== Items table =====
      const tableTop = lineOffset + 25;
      const tableLeft = 50;
      const tableWidth = 500;
      const rowHeight = 24;

      // Header background
      doc
        .roundedRect(tableLeft, tableTop, tableWidth, rowHeight, 4)
        .fillAndStroke('#F3F4F6', '#E5E7EB');

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#111827');

      const descCol = tableLeft + 10;
      const qtyCol = tableLeft + 280;
      const unitCol = tableLeft + 350;
      const totalCol = tableLeft + 430;

      doc.text('Description', descCol, tableTop + 7, { width: 250 });
      doc.text('Qty', qtyCol, tableTop + 7, { width: 50, align: 'right' });
      doc.text('Unit Price', unitCol, tableTop + 7, { width: 70, align: 'right' });
      doc.text('Total', totalCol, tableTop + 7, { width: 70, align: 'right' });

      // Reset fill for rows
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#111827')
        .strokeColor('#E5E7EB');

      let rowY = tableTop + rowHeight;

      items.forEach((item) => {
        // Row separator
        doc
          .moveTo(tableLeft, rowY)
          .lineTo(tableLeft + tableWidth, rowY)
          .stroke();

        const textY = rowY + 7;

        doc
          .fillColor('#111827')
        .text(item.description ?? '', descCol, textY, {
            width: 250,
            ellipsis: true,
          })
          .fillColor('#111827')
          .text(item.quantity.toString(), qtyCol, textY, {
            width: 50,
            align: 'right',
          })
          .text(`₹${item.unitPrice}`, unitCol, textY, {
            width: 70,
            align: 'right',
          })
          .text(`₹${item.totalPrice}`, totalCol, textY, {
            width: 70,
            align: 'right',
          });

        rowY += rowHeight;
      });

      // Bottom border of table
      doc
        .moveTo(tableLeft, rowY)
        .lineTo(tableLeft + tableWidth, rowY)
        .stroke();

      // ===== Totals block =====
      let nextSectionTop = rowY + 30;

      if (extraDetails) {
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#111827')
          .text('Additional Details', 50, nextSectionTop);
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#4B5563')
          .text(extraDetails, 50, nextSectionTop + 16, {
            width: 240,
            lineGap: 2,
          });
        nextSectionTop = doc.y + 15;
      }

      const totalsTop = Math.max(nextSectionTop, rowY + 30);
      const totalsLeft = 320;
      const totalsWidth = 230;

      doc
        .roundedRect(totalsLeft, totalsTop, totalsWidth, 80, 6)
        .fillAndStroke('#F9FAFB', '#E5E7EB');

      const labelX = totalsLeft + 15;
      const valueX = totalsLeft + totalsWidth - 15;
      let totalsLineY = totalsTop + 12;

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#4B5563')
        .text('Subtotal', labelX, totalsLineY, { width: 100 });
      doc
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text(`₹${subtotal}`, valueX - 100, totalsLineY, {
          width: 100,
          align: 'right',
        });

      totalsLineY += 18;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#4B5563')
        .text('Tax', labelX, totalsLineY, { width: 100 });
      doc
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text(`₹${taxAmount}`, valueX - 100, totalsLineY, {
          width: 100,
          align: 'right',
        });

      totalsLineY += 22;
      doc
        .moveTo(totalsLeft + 10, totalsLineY)
        .lineTo(totalsLeft + totalsWidth - 10, totalsLineY)
        .strokeColor('#E5E7EB')
        .stroke();

      totalsLineY += 8;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#111827')
        .text('Total', labelX, totalsLineY, { width: 100 });
      doc.text(`₹${totalAmount}`, valueX - 100, totalsLineY, {
        width: 100,
        align: 'right',
      });

      // ===== Footer =====
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#9CA3AF')
        .text(
          'Thank you for your business. Please contact us if you have any questions about this invoice.',
          50,
          760,
          { width: 500, align: 'center' },
        );

      doc.end();
    } catch (error) {
      if (!res.headersSent) {
        throw new InternalServerErrorException('Failed to generate invoice PDF');
      }
      res.end();
    }
  }

  private formatDate(value: Date | string | null | undefined): string {
    if (!value) {
      return 'N/A';
    }
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toDateString();
  }

  private formatMoney(value: number | string | null | undefined): string {
    const numericValue = Number(value ?? 0);
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  }

  private normalizeItem(item: InvoiceItem) {
    return {
      description: item.description,
      quantity: Number(item.quantity ?? 0),
      unitPrice: this.formatMoney(item.unitPrice),
      totalPrice: this.formatMoney(item.totalPrice ?? Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0)),
    };
  }

  private fallbackText(value: string | null | undefined, fallback: string): string {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
  }

  private splitLines(value: string | null | undefined, fallback: string[]): string[] {
    if (!value) {
      return [...fallback];
    }
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.length > 0 ? lines : [...fallback];
  }
}