import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { ListServiceDto } from './dtos/list-service.dto';
import { CreateServiceDto } from './dtos/create-service.dto';

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
