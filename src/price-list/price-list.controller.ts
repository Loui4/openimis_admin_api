import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PriceListService } from './price-list.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PriceListDto } from './dtos/price-list.dto';
import { CreatePLServiceDto } from './dtos/create-price-list.dto';

@Controller('price-list')
export class PriceListController {
  constructor(private readonly priceListService: PriceListService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Price List Services' })
  @ApiResponse({ status: 200, description: 'List of Price List Services', type: [PriceListDto] })
  getAll() {
    return this.priceListService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Price List Service' })
  @ApiResponse({ status: 201, description: 'The newly created Price List Service' })
  async create(@Body() dto: CreatePLServiceDto) {
    return this.priceListService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single Price List Service by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Price List ID' })
  @ApiResponse({ status: 200, description: 'Single Price List Service' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.priceListService.findOne(id);
  }

}
