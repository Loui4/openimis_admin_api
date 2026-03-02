import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsInt, IsOptional } from 'class-validator';

export class ProductDto {
  @ApiProperty({ example: 'BL1234', description: 'Product code' })
  productCode: string;

  @ApiProperty({ example: 'BALAKASLA', description: 'Product name' })
  productName: string;

  @ApiProperty({ example: 'South East', description: 'Region name' })
  region: string;

  @ApiProperty({ example: 'Balaka', description: 'District name' })
  district: string;

  @ApiProperty({ example: 2, description: 'Number of services' })
  numberOfServices: number;

  @ApiProperty({ example: 7000, description: 'Member count' })
  memberCount: number;
}

export class CreateProductDto {
  @ApiProperty({
    example: 'BL1234',
    description: 'Unique product code',
  })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty({
    example: 'BALAKA SLA PACKAGE',
    description: 'Product name',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    example: '2026-01-01',
    description: 'Product start date',
    type: String,
    format: 'date',
  })
  @IsDateString()
  dateFrom: Date;

  @ApiProperty({
    example: '2026-12-31',
    description: 'Product end date',
    type: String,
    format: 'date',
  })
  @IsDateString()
  dateTo: Date;

  @ApiProperty({
    example: 150000.0,
    description: 'Lump sum amount',
  })
  @IsNumber()
  @Min(0)
  lumpSum: number;

  @ApiProperty({
    example: 5,
    description: 'Number of members covered',
  })
  @IsInt()
  @Min(1)
  memberCount: number;

  @ApiProperty({
    example: 0,
    description: 'Grace period in days',
  })
  @IsInt()
  @Min(0)
  gracePeriod: number;

  @ApiProperty({
    example: 1,
    description: 'Audit user ID',
  })
  @IsInt()
  auditUserId: number;

  @ApiProperty({
    example: 12,
    description: 'Insurance period in months',
  })
  @IsInt()
  @Min(1)
  insurancePeriod: number;

  @ApiProperty({
    example: 101,
    description: 'District location ID',
    required: false,
  })
  @IsOptional()
  @IsInt()
  locationId?: number;
}
