import {
    IsString,
    IsEmail,
    IsOptional,
    IsDateString,
    IsArray,
    ValidateNested,
    ArrayMinSize,
    IsNotEmpty,
    IsNumber,
    Min,
    Matches,
} from 'class-validator';
import { Type } from 'class-transformer';



class CreateInvoiceItemDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0.01)
    unitPrice: number;
}

export class CreateInvoiceDto {





    @IsString()
    @IsNotEmpty()
    clientName: string;

    @IsOptional()
    @IsString()
    clientAddress?: string;

    @IsOptional()
    @IsEmail()
    clientEmail?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[\+]?[0-9\s\-\(\)\.]{7,20}$/, {
        message: 'clientPhone must be a valid phone number',
    })
    clientPhone?: string;

    @IsDateString()
    issueDate: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    taxAmount?: number;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items: CreateInvoiceItemDto[];
}