import { Module } from '@nestjs/common';
import { InvoiceController } from 'src/controllers/invoice/invoice.controller';
import { InvoiceService } from 'src/services/invoice/invoice.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from 'src/entities/invoice.entity';
import { InvoiceItem } from 'src/entities/invoice-item.entity';



@Module({

    imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem])],
    controllers: [InvoiceController],
    providers: [InvoiceService],
    exports: [InvoiceService],
})
export class InvoiceModule { }
