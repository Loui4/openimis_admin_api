import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateServicePriceDto {
  @ApiProperty({ example: 2500.0, description: 'Updated service price (in MWK)' })
  @IsNumber()
  ServPrice: number;
}
