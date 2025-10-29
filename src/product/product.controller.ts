import { Controller, Get } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './dtos/product.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products', type: [ProductDto] })
  getAll() {
    return this.productService.findAll();
  }
}


