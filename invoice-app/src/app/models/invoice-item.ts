export interface InvoiceItem {
    id?: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
    invoiceId?: number;
 }
  