import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PdfCustomizationDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fromName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  fromAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fromEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  extraDetails?: string;
}

