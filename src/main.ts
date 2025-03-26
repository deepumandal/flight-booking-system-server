import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { envConfig } from "./common/config/env";
import { GlobalCatchHandler } from "./common/filters/global-catch.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalCatchHandler());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <-- THIS IS MANDATORY for @Transform to work
      whitelist: true,
    })
  );

  app.enableCors({ credentials: true, origin: true });

  const config = new DocumentBuilder()
    .setTitle("API Title")
    .setDescription("Api Description")
    .setVersion("1.0")
    .addTag("APIS")
    .addBearerAuth()
    .addServer("http://localhost:4000")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  SwaggerModule.setup("docs-api", app, document, {
    jsonDocumentUrl: "/docs/open-api",
  });
  await app.listen(envConfig("PORT") || 3000, () => {
    // eslint-disable-next-line no-console
    console.log("Server running on port 3000 🚀");
  });
}

void bootstrap();
