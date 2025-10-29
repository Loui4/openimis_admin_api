import { Controller, Get } from '@nestjs/common';
import { PriceListService } from './price-list.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PriceListDto } from './dtos/price-list.dto';

@Controller('price-list')
export class PriceListController {
  constructor(private readonly priceListService: PriceListService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Price List Services' })
  @ApiResponse({ status: 200, description: 'List of Price List Services', type: [PriceListDto] })
  getAll() {
    return this.priceListService.findAll();
  }
}
