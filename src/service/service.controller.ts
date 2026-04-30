import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { ListServiceDto } from './dtos/list-service.dto';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServicePriceDto } from './dtos/update-service-price.dto';

@ApiTags('Service')
@Controller('service')
@ApiBearerAuth('access-token')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @ApiOperation({ summary: 'List all active services' })
  @ApiOkResponse({ type: [ListServiceDto] })
  async findAll(): Promise<ListServiceDto[]> {
    return this.serviceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an active service by ID' })
  @ApiOkResponse({ type: ListServiceDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ListServiceDto> {
    return this.serviceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiCreatedResponse({ description: 'Service successfully created' })
  async create(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }

  @Post('medical-service')
  @ApiOperation({ summary: 'Create a new medical service' })
  @ApiCreatedResponse({ description: 'Medical service successfully created' })
  async createMedicalService(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an active medical service' })
  @ApiOkResponse({ type: ListServiceDto })
  async updateMedicalService(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateServiceDto,
  ) {
    return this.serviceService.update(id, dto);
  }

  @Patch(':id/price')
  @ApiOperation({ summary: 'Update an active medical service price' })
  @ApiOkResponse({ type: ListServiceDto })
  async updateMedicalServicePrice(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicePriceDto,
    @Request() req: { user?: { userId?: number | string } },
  ) {
    const auditUserId = Number(req.user?.userId);
    return this.serviceService.updatePrice(
      id,
      dto.ServPrice,
      Number.isFinite(auditUserId) ? auditUserId : undefined,
    );
  }

  // ✅ New CSV Upload Endpoint
  @Post('dry-upload-csv')
  @ApiOperation({ summary: 'Upload CSV file to bulk insert services' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'CSV file processed successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async dryUploadCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file provided');
    }
     return this.serviceService.analyzeCsv(file.buffer.toString('utf-8'));
  }

  @Post('upload-csv')
  @ApiOperation({ summary: 'Upload CSV file to bulk insert services' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'CSV file processed successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file provided');
    }
     return this.serviceService.importCsv(file.buffer.toString('utf-8'),1);
  }
}
