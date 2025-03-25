import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalCatchHandler } from './common/filters/global-catch.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalCatchHandler());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.setGlobalPrefix('api/v1');

  app.enableCors({ credentials: true, origin: 'http://localhost:3000' });

  const config = new DocumentBuilder()
    .setTitle('API Title')
    .setDescription('Api Description')
    .setVersion('1.0')
    .addTag('APIS')
    .addBearerAuth()
    .addServer('http://localhost:4000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  SwaggerModule.setup('docs-api', app, document, {
    jsonDocumentUrl: '/docs/open-api',
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
