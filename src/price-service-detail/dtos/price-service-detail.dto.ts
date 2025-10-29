import { ApiProperty } from '@nestjs/swagger';

export class PriceListServiceDetailDto {
  @ApiProperty({ example: 101, description: 'Service ID' })
  ServiceID: number;

  @ApiProperty({ example: 'SVC001', description: 'Service code' })
  ServCode: string;

  @ApiProperty({ example: 'General Consultation', description: 'Service name' })
  ServName: string;

  @ApiProperty({ example: 'Consultation', description: 'Service type' })
  ServType: string;

  @ApiProperty({ example: 50, description: 'Service price' })
  ServPrice: number;
}
