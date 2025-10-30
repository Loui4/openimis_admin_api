import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'SRV-001', description: 'Unique service code' })
  @IsString()
  @Length(1, 6)
  ServCode: string;

  @ApiProperty({ example: 'General Consultation', description: 'Name of the service' })
  @IsString()
  @MaxLength(100)
  ServName: string;

  @ApiProperty({ example: 'O', description: 'Service type (e.g., O=Outpatient, I=Inpatient)' })
  @IsString()
  @Length(1, 1)
  ServType: string;

  @ApiProperty({ example: '1', description: 'Service level identifier' })
  @IsString()
  @Length(1, 1)
  ServLevel: string;

  @ApiProperty({ example: 2500.0, description: 'Service price (in MWK)' })
  @IsNumber()
  ServPrice: number;

  @ApiProperty({ example: 'O', description: 'Care type (O=Outpatient, I=Inpatient)' })
  @IsString()
  @Length(1, 1)
  ServCareType: string;

  @ApiProperty({ example: 1, description: 'Service frequency', required: false })
  @IsOptional()
  @IsNumber()
  ServFrequency?: number;

  @ApiProperty({ example: 1, description: 'Patient category ID' })
  @IsNumber()
  ServPatCat: number;

  @ApiProperty({ example: '2024-08-01', description: 'Start date of validity' })
  @IsDateString()
  ValidityFrom: string;

  @ApiProperty({ example: 1, description: 'ID of the user creating the service' })
  @IsNumber()
  AuditUserID: number;

  @ApiProperty({ example: 5000.0, description: 'Maximum allowable amount', required: false })
  @IsOptional()
  @IsNumber()
  MaximumAmount?: number;

  @ApiProperty({ example: true, description: 'Indicates if the price can be manually entered' })
  @IsBoolean()
  manualPrice: boolean;

  @ApiProperty({ example: 'S', description: 'Service package type' })
  @IsString()
  @Length(1, 1)
  ServPackageType: string;

  @ApiProperty({ example: 'A', description: 'Service category (A, B, etc.)', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  ServCategory?: string;

  @ApiProperty({ example: 123, description: 'Legacy system ID', required: false })
  @IsOptional()
  @IsNumber()
  LegacyID?: number;
}
