import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from 'src/entities/invoice.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChartService {
    constructor(@InjectRepository(Invoice)

    private invoiceRepository: Repository<Invoice>
    ) { }

    async getIncomeStats(userId: number, period: 'day' | 'week' | 'month' | 'year'): Promise<any> {
        if (!userId) {
            throw new BadRequestException('User context is required to fetch income stats');
        }

        let dateTrunc;
        switch (period) {
            case 'day':
                dateTrunc = 'day';
                break;
            case 'week':
                dateTrunc = 'week';
                break;
            case 'month':
                dateTrunc = 'month';
                break;
            case 'year':
                dateTrunc = 'year';
                break;
            default:
                throw new BadRequestException('Invalid period parameter');
        }

        const rawData = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select(`DATE_TRUNC('${dateTrunc}', invoice.issueDate)`, 'period')
            .addSelect('SUM(invoice.totalAmount)', 'total')
            .where('invoice.userId = :userId', { userId })
            .andWhere('invoice.status = :status', { status: 'paid' }) // consider only paid invoices for income
            .groupBy('period')
            .orderBy('period')
            .getRawMany();

        // Map data to labels and values arrays
        const labels = rawData.map(r => {
            const date: Date = r.period;
            switch (period) {
                case 'day':
                    return date.toISOString().slice(0, 10); // YYYY-MM-DD
                case 'week':
                    // Format as year + week number
                    const week = this.getWeekNumber(date);
                    return `${date.getFullYear()}-W${week}`;
                case 'month':
                    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
                case 'year':
                    return `${date.getFullYear()}`;
            }
        });
        const values = rawData.map(r => parseFloat(r.total) || 0);

        return { labels, values };
    }

    // Helper to get ISO week number
    private getWeekNumber(date: Date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }
}
