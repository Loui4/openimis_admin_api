import { Controller, Get, Query } from '@nestjs/common';
import { PriceServiceDetailService } from './price-service-detail.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PriceListServiceDetailDto } from './dtos/price-service-detail.dto';

@Controller('price-service-detail')
export class PriceServiceDetailController {
  constructor(private readonly priceServiceDetailService: PriceServiceDetailService) {}



  @Get()
  @ApiOperation({ summary: 'Get all PL Service Details' })
  @ApiQuery({ name: 'priceListId', required: true, type: Number, description: 'Filter by priceListId' })
  @ApiResponse({ status: 200, description: 'List of PL Service Details', type: [PriceListServiceDetailDto] })
  async findAll(
    @Query('priceListId') priceListId: number,
  ): Promise<PriceListServiceDetailDto[]> {
    return this.priceServiceDetailService.findAll(Number(priceListId));
  }
}
