import { Module } from '@nestjs/common';
import { PriceServiceDetailService } from './price-service-detail.service';
import { PriceServiceDetailController } from './price-service-detail.controller';

@Module({
  controllers: [PriceServiceDetailController],
  providers: [PriceServiceDetailService],
})
export class PriceServiceDetailModule {}
