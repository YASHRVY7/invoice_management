import { Controller, ValidationPipe, UsePipes, Post, HttpCode, HttpStatus, Get, Put, Delete, Patch, Body, Param, ParseIntPipe, Query, DefaultValuePipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateInvoiceDto } from 'src/dto/create-invoice.dto';
import { UpdateInvoiceDto } from 'src/dto/update-invoice.dto';
import { InvoiceService } from 'src/services/invoice/invoice.service';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('invoices')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseGuards(JwtAuthGuard)

export class InvoiceController {

    constructor(private readonly invoiceService: InvoiceService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req: Request) {
        const userId = this.getUserIdFromRequest(req);
        const invoice = await this.invoiceService.createInvoice(createInvoiceDto, userId);
        return {
            success: true,
            message: 'Invoice created successfully',
            data: invoice,
        }
    }

    @Get()
    async getAllInvoices(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Req() req: Request,
        @Query('status') status?: string,
        @Query('clientName') clientName?: string,
    ) {
        const userId = this.getUserIdFromRequest(req);
        const result = await this.invoiceService.getAllInvoicesForUser(userId, page, limit, status, clientName);

        return {
            success: true,
            message: 'Invoices retrieved successfully',
            data: result.invoices,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.total,
                itemsPerPage: limit,
            },
        };
    }
    @Get('statistics')
    async getStatistics(@Req() req: Request) {
      const userId = this.getUserIdFromRequest(req);
      const stats = await this.invoiceService.getInvoiceStatistics(userId);
      return {
        success: true,
        message: 'Statistics retrieved successfully',
        data: stats,
      };
    }

    @Get(':id')
    async getInvoiceById(@Param('id', ParseIntPipe) id: number) {
        const invoice = await this.invoiceService.getInvoiceById(id)
        return {
            success: true,
            message: 'Invoice retrieved successfully',
            data: invoice,
        }
    }


    @Put(':id')
    async updateInvoice(@Param('id', ParseIntPipe) id: number, @Body() updateInvoiceDto: UpdateInvoiceDto) {
        const invoice = await this.invoiceService.updateInvoice(id, updateInvoiceDto);
        return {
            success: true,
            message: 'Invoice updated successfully',
            data: invoice,
        };
    }

    @Patch(':id/status')
    async updateInvoiceStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
        const invoice = await this.invoiceService.updateInvoiceStatus(id, status);
        return {
            success: true,
            message: 'Invoice status updated successfully',
            data: invoice,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteInvoice(@Param('id', ParseIntPipe) id: number) {
        await this.invoiceService.deleteInvoice(id);
        return {
            success: true,
            message: 'Invoice deleted successfully',
        };
    }

    private getUserIdFromRequest(req: Request): number {
        const user = req.user as { userId?: number; id?: number } | undefined;
        const userId = user?.userId ?? user?.id;

        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }

        return userId;
    }
}
