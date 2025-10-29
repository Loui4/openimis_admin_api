import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { PriceListModule } from './price-list/price-list.module';

@Module({
  imports: [PrismaModule, ProductModule, PriceListModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
