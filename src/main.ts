import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // or specify domains like ['https://example.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Admin API')
    .setDescription('API documentation for OpenIMIS Admin API')
    .setVersion('1.0')
    .addBearerAuth() // Optional: if you use JWT auth
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true, // throws error for unknown props
      transform: true, // automatically transforms payloads to DTO instances
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(4000);
}
bootstrap();
