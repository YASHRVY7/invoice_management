import { Body, Controller, Get, Param, ParseIntPipe, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { PdfService } from 'src/services/pdf/pdf.service';
import { PdfCustomizationDto } from 'src/dto/pdf-customization.dto';



@Controller('pdf')  
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('invoice/:id')
  async getInvoicePdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response):Promise<void> {
    await this.pdfService.generateInvoicePdf(id, res);
  }

  @Post('invoice/:id')
  async postInvoicePdf(
    @Param('id', ParseIntPipe) id: number,
    @Body() customization: PdfCustomizationDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.pdfService.generateInvoicePdf(id, res, customization);
  }
}