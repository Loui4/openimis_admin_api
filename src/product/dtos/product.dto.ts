import { ApiProperty } from '@nestjs/swagger';

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
