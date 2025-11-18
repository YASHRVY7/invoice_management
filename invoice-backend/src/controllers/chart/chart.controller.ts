import { Controller, UseGuards, Get, Query, Req, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { ChartService } from 'src/services/chart/chart.service';
import type { Request } from 'express';

@Controller('chart')
@UseGuards(JwtAuthGuard)
export class ChartController {
    constructor(private readonly chartService: ChartService) { }

    @Get('income')
    async getIncomeChart(
        @Req() req: Request,
        @Query('period') period: 'day' | 'week' | 'month' | 'year',
    ) {
        const userId = (req.user as { userId?: number }).userId;
        if (!userId) throw new BadRequestException('User not authenticated');

        if (!['day', 'week', 'month', 'year'].includes(period)) {
            throw new BadRequestException('Invalid period query param');
        }
        const data = await this.chartService.getIncomeStats(userId, period as any);
        return { success: true, message: 'Income chart retrieved successfully', data };
    }
}
