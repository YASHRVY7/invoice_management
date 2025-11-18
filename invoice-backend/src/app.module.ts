import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { ChartModule } from './modules/chart/chart.module';
import { PdfService } from './services/pdf/pdf.service';
import { PdfController } from './controllers/pdf/pdf.controller';
import { PdfModule } from './modules/pdf/pdf.module';
import { AdminModule } from './admin/admin.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',// Makes config available everywhere
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    InvoiceModule,
    AuthModule,
    ChartModule,
    PdfModule,
    AdminModule
  ],
  controllers: [AppController, PdfController],
  providers: [AppService, PdfService],
})
export class AppModule { }
