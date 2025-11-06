import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PriceServiceDetailService } from './price-service-detail.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PriceListServiceDetailDto } from './dtos/price-service-detail.dto';
import { CreatePriceServiceDetailDto } from './dtos/create-price-service-details.dto';

@ApiTags('Price Service Detail')
@Controller('price-service-detail')
@ApiBearerAuth('access-token')
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

  @Post()
  @ApiOperation({ summary: 'Create new PL Service Details' })
  @ApiBody({ type: CreatePriceServiceDetailDto })
  @ApiResponse({ status: 201, description: 'PL Service Details created successfully' })
  async create(@Body() dto: CreatePriceServiceDetailDto) {
    return this.priceServiceDetailService.createOrUpdate({
      PLServiceID: dto.PLServiceID,
      services: dto.services.map((s) => ({
        ServiceID: s.ServiceID,
        ValidityFrom: new Date(s.ValidityFrom),
        ValidityTo: s.ValidityTo ? new Date(s.ValidityTo) : null,
      })),
    });
  }
}
