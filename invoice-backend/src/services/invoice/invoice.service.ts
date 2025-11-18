import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateInvoiceDto } from 'src/dto/create-invoice.dto';
import { UpdateInvoiceDto } from 'src/dto/update-invoice.dto';
import { InvoiceItem } from 'src/entities/invoice-item.entity';
import { Invoice } from 'src/entities/invoice.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,

        @InjectRepository(InvoiceItem)
        private invoiceItemRepository: Repository<InvoiceItem>
    ) { }

    /**
     * Calculate and update invoice status based on due date
     * - If status is 'cancelled' or 'paid', don't change it
     * - If status is 'unpaid' and dueDate is in the past, set to 'overdue'
     */
    private calculateInvoiceStatus(invoice: Invoice): Invoice {
        // Don't change status if it's cancelled or paid
        if (invoice.status === 'cancelled' || invoice.status === 'paid') {
            return invoice;
        }

        // If unpaid and due date has passed, mark as overdue
        if (invoice.status === 'unpaid' && invoice.dueDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDate = new Date(invoice.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                invoice.status = 'overdue';
            }
        }

        return invoice;
    }

    async createInvoice(createInvoiceDto: CreateInvoiceDto, userId: number): Promise<Invoice> {
        try {
            if (!userId) {
                throw new BadRequestException('User context is required to create an invoice');
            }
            const invoice = new Invoice();
            invoice.userId = userId;
            invoice.clientName = createInvoiceDto.clientName;
            invoice.clientAddress = createInvoiceDto.clientAddress ?? null;
            invoice.clientEmail = createInvoiceDto.clientEmail ?? null;
            invoice.clientPhone = createInvoiceDto.clientPhone ?? null;
            invoice.issueDate = new Date(createInvoiceDto.issueDate);
            if (createInvoiceDto.dueDate) {
                invoice.dueDate = new Date(createInvoiceDto.dueDate);
            }
            invoice.taxAmount = createInvoiceDto.taxAmount || 0;
            const subtotal = createInvoiceDto.items.reduce(
                (sum, item) => sum + item.quantity * item.unitPrice,
                0,
            );
            invoice.subtotal = subtotal;
            invoice.totalAmount = subtotal + invoice.taxAmount;
            invoice.items = createInvoiceDto.items.map((itemDto) => {
                const item = new InvoiceItem();
                item.description = itemDto.description;
                item.quantity = itemDto.quantity;
                item.unitPrice = itemDto.unitPrice;
                item.totalPrice = itemDto.quantity * itemDto.unitPrice;
                return item;
            });
            // Calculate status before saving
            this.calculateInvoiceStatus(invoice);
            return await this.invoiceRepository.save(invoice);
        } catch (error) {
            throw new BadRequestException('Failed to create invoice: ' + error.message);
        }
    }

    async getInvoiceById(id: number): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findOne({
            where: { id },
            relations: ['items'],
        });
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        // Calculate and update status if needed
        const originalStatus = invoice.status;
        this.calculateInvoiceStatus(invoice);
        // Save if status changed to overdue
        if (invoice.status === 'overdue' && originalStatus !== 'overdue') {
            await this.invoiceRepository.save(invoice);
        }
        return invoice;
    }

    async updateInvoice(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
        const invoice = await this.getInvoiceById(id);
        Object.assign(invoice, updateInvoiceDto);

        if (updateInvoiceDto.items) {
            // Remove existing items
            await this.invoiceItemRepository.delete({ invoiceId: id });
            // Create new items
            const newItems = updateInvoiceDto.items.map(itemDto => {
                const item = new InvoiceItem();
                item.description = itemDto.description;
                item.quantity = itemDto.quantity;
                item.unitPrice = itemDto.unitPrice;
                item.invoiceId = id;
                return item;
            });

            invoice.items = newItems;
            // Recalculate totals
            const subtotal = newItems.reduce(
                (sum, item) => sum + (item.quantity * item.unitPrice),
                0
            );
            invoice.subtotal = subtotal;
            invoice.totalAmount = subtotal + (invoice.taxAmount || 0);
        }
        // Calculate status before saving (only if status wasn't explicitly set to cancelled)
        if (updateInvoiceDto.status !== 'cancelled') {
            this.calculateInvoiceStatus(invoice);
        }
        return await this.invoiceRepository.save(invoice);
    }

    async deleteInvoice(id: number): Promise<void> {
        const result = await this.invoiceRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
    }

    async getAllInvoicesForUser(
        userId: number,
        page = 1,
        limit = 10,
        status?: string,
        clientName?: string,
    ) {
        if (!userId) {
            throw new BadRequestException('User context is required to list invoices');
        }

        const queryBuilder = this.invoiceRepository
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.items', 'items')
            .where('invoice.userId = :userId', { userId })
            .orderBy('invoice.createdAt', 'DESC');

        if (status) {
            if (status === 'overdue') {
                // For overdue filter, include both explicitly overdue and unpaid invoices past due date
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                queryBuilder.andWhere(
                    '(invoice.status = :status OR (invoice.status = :unpaidStatus AND invoice.dueDate < :today AND invoice.dueDate IS NOT NULL))',
                    { status: 'overdue', unpaidStatus: 'unpaid', today }
                );
            } else {
                queryBuilder.andWhere('invoice.status = :status', { status });
            }
        }

        if (clientName) {
            queryBuilder.andWhere('invoice.clientName ILIKE :clientName', { clientName: `%${clientName}%` });
        }

        const total = await queryBuilder.getCount();
        const invoices = await queryBuilder.skip((page - 1) * limit).take(limit).getMany();
        
        // Calculate and update status for all invoices
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (const invoice of invoices) {
            const originalStatus = invoice.status;
            this.calculateInvoiceStatus(invoice);
            // Save if status changed to overdue
            if (invoice.status === 'overdue' && originalStatus !== 'overdue') {
                await this.invoiceRepository.save(invoice);
            }
        }
        
        const totalPages = Math.ceil(total / limit);
        return { invoices, total, totalPages };
    }

    async getInvoiceStatistics(userId: number): Promise<any> {
        if (!userId) {
            throw new BadRequestException('User context is required to fetch statistics');
        }

        // First, update any invoices that should be overdue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const unpaidInvoicesToUpdate = await this.invoiceRepository.find({
            where: { userId, status: 'unpaid' },
        });
        
        for (const invoice of unpaidInvoicesToUpdate) {
            if (invoice.dueDate) {
                const dueDate = new Date(invoice.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                if (dueDate < today) {
                    invoice.status = 'overdue';
                    await this.invoiceRepository.save(invoice);
                }
            }
        }

        const totalInvoices = await this.invoiceRepository.count({ where: { userId } });
        const paidInvoices = await this.invoiceRepository.count({ where: { status: 'paid', userId } });
        const unpaidInvoices = await this.invoiceRepository.count({ where: { status: 'unpaid', userId } });
        const overdueInvoices = await this.invoiceRepository.count({ where: { status: 'overdue', userId } });
        const totalRevenue = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.totalAmount)', 'total')
            .where('invoice.status = :status', { status: 'paid' })
            .andWhere('invoice.userId = :userId', { userId })
            .getRawOne();
        return {
            totalInvoices,
            paidInvoices,
            unpaidInvoices,
            overdueInvoices,
            totalRevenue: parseFloat(totalRevenue.total) || 0,
        };
    }

    async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findOne({
            where: { id },
            relations: ['items'],
        });
        
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        
        // Prevent manually setting cancelled invoices to overdue
        if (invoice.status === 'cancelled' && status === 'overdue') {
            throw new BadRequestException('Cannot set cancelled invoice to overdue status');
        }
        
        invoice.status = status;
        
        // If setting to unpaid, recalculate status to check if it should be overdue
        if (status === 'unpaid') {
            this.calculateInvoiceStatus(invoice);
        }
        
        return await this.invoiceRepository.save(invoice);
    }

}
