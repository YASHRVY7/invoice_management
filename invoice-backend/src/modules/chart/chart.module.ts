import { Module } from '@nestjs/common';
import { ChartController } from 'src/controllers/chart/chart.controller';
import { ChartService } from 'src/services/chart/chart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from 'src/entities/invoice.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Invoice])],
    controllers: [ChartController],
    providers: [ChartService],
})
export class ChartModule {}
