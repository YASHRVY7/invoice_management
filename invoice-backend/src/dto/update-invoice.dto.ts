import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsOptional()
  @IsEnum(['unpaid', 'paid', 'overdue', 'cancelled'])
  status?: string;


  
}
