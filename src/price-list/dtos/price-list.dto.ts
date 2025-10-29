import { ApiProperty } from '@nestjs/swagger';

export class PriceListDto {
  @ApiProperty({ example: 37, description: 'Price List Service ID' })
  PLServiceID: number;

  @ApiProperty({ example: 'All Service Price List', description: 'Price List Service Name' })
  PLServName: string;

  @ApiProperty({ example: '2024-08-20T00:00:00.000Z', description: 'Date of the Price List' })
  DatePL: Date;

  @ApiProperty({ example: 81, description: 'Number of services in the price list' })
  NumberOfServices: number;
}
