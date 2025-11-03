import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';


export class CreatePLServiceDto {

  @ApiProperty({ example: 'All Service Price List', description: 'Name of the Price List Service' })
  @IsString()
  PLServName: string;

  @ApiProperty({ example: '2024-08-20', description: 'Date of the Price List', type: String })
  @IsDateString()
  DatePL: string;

  @ApiProperty({ example: '2024-08-01', description: 'Start date of validity', type: String })
  @IsDateString()
  ValidityFrom: string;

  @ApiProperty({ example: 'admin', description: 'User who created or updated the record' })
  @IsOptional()
  @IsNumber()
  AuditUserID?: number;

  @ApiProperty({ example: 3, description: 'Location ID associated with this Price List Service', required: false })
  @IsOptional()
  @IsNumber()
  LocationId?: number;

  @ApiProperty({ example: 123, description: 'Legacy system ID, if any', required: false })
  @IsOptional()
  @IsNumber()
  LegacyID?: number;
}

