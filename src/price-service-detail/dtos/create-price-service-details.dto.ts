import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ServiceDetailItemDto {
  @ApiProperty({
    example: 101,
    description: 'ID of the service being added to the price list',
  })
  @IsInt()
  ServiceID: number;

  @ApiProperty({
    example: '2025-10-30T00:00:00Z',
    description: 'Start date when the service becomes valid in this price list',
  })
  @IsDateString()
  ValidityFrom: string;

  @ApiPropertyOptional({
    example: null,
    description:
      'Optional end date when the service is no longer valid. Can be null.',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  ValidityTo?: string;
}

export class CreatePriceServiceDetailDto {
  @ApiProperty({
    example: 1,
    description: 'The Price List (PLService) ID to which the services belong',
  })
  @IsInt()
  PLServiceID: number;

  @ApiProperty({
    description: 'Array of service details to be linked to the price list',
    type: [ServiceDetailItemDto],
    example: [
      {
        ServiceID: 101,
        ValidityFrom: '2025-10-30T00:00:00Z',
        ValidityTo: '2026-10-30T00:00:00Z',
      },
      {
        ServiceID: 102,
        ValidityFrom: '2025-11-01T00:00:00Z',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceDetailItemDto)
  services: ServiceDetailItemDto[];
}
