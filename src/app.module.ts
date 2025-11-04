import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { PriceListModule } from './price-list/price-list.module';
import { PriceServiceDetailModule } from './price-service-detail/price-service-detail.module';
import { ServiceModule } from './service/service.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';


@Module({
  imports: [PrismaModule, ProductModule, PriceListModule, PriceServiceDetailModule, ServiceModule, AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
