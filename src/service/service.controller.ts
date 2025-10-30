import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiQuery } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { ListServiceDto } from './dtos/list-service.dto';
import { CreateServiceDto } from './dtos/create-service.dto';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @ApiOperation({ summary: 'List all active services' })
  @ApiOkResponse({ type: [ListServiceDto] })
  // @ApiQuery({ name: 'servType', required: false })
  // @ApiQuery({ name: 'servLevel', required: false })
  async findAll(
    // @Query('servType') servType?: string,
    // @Query('servLevel') servLevel?: string,
  ): Promise<ListServiceDto[]> {
    // return this.serviceService.findAll({ servType, servLevel });
    return this.serviceService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiCreatedResponse({ description: 'Service successfully created' })
  async create(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }
}
