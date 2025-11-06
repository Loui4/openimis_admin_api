import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from "./user/jwt-auth.guard";  // adjust path if needed
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const globalPrefix = process.env.GLOBAL_PREFIX || 'api/v1'

  // Optional: enable CORS if you need it
  // app.enableCors({
  //   origin: '*',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  // });

  app.setGlobalPrefix(globalPrefix);

  // Redirect root '/' to '/api/v1'
  app.use((req, res, next) => {
    if (req.path === '/') {
      return res.redirect(globalPrefix);
    }
    next();
  });

  // ✅ Add Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Set up Swagger with Bearer token auth
  const config = new DocumentBuilder()
    .setTitle('Admin API')
    .setDescription('API documentation for OpenIMIS Admin API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📘 Swagger Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
