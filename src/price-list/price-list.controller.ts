import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { PriceListService } from './price-list.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PriceListDto } from './dtos/price-list.dto';
import { CreatePLServiceDto } from './dtos/create-price-list.dto';

@ApiTags('Price List Services')
@Controller('price-list')
@ApiBearerAuth('access-token')
export class PriceListController {
  constructor(private readonly priceListService: PriceListService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Price List Services' })
  @ApiResponse({
    status: 200,
    description: 'List of Price List Services',
    type: [PriceListDto],
  })
  getAll() {
    return this.priceListService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Price List Service' })
  @ApiResponse({
    status: 201,
    description: 'The newly created Price List Service',
  })
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

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a Price List Service (sets ValidityTo)' })
  @ApiParam({ name: 'id', type: Number, description: 'Price List ID' })
  @ApiResponse({ status: 200, description: 'Price List Service soft-deleted' })
  @ApiResponse({ status: 404, description: 'Price List Service not found' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.priceListService.delete(id);
  }
}
