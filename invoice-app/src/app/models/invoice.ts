import { InvoiceItem } from "./invoice-item";


export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id?: number;
  invoiceNumber?: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  issueDate: string;
  dueDate?: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  status?: InvoiceStatus;
  items: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedInvoices {
  success: boolean;
  message?: string;
  data: Invoice[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface InvoiceStatistics {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  totalRevenue: number;
}
