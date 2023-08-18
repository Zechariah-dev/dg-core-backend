import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, ValidationPipe } from "@nestjs/common";
import * as session from "express-session";
import { ResponseInterceptor } from "./interceptors/response.interceptors";
import { WebSocketAdapter } from "./modules/v1/gateway/gateway.adapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const logger = new Logger("Main");

  const websocketAdapter = new WebSocketAdapter(app);

  // swagger setup
  const options = new DocumentBuilder()
    .setTitle("Api V1")
    .setDescription("Digitex backend server docs")
    .setVersion("1.0")
    .addBearerAuth({ in: "header", type: "http" })
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup("api-docs", app, document);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );
  app.use(
    session({
      secret: configService.get<string>("SESSION_SECRET"),
      resave: false,
      saveUninitialized: false,
    })
  );

  app.useWebSocketAdapter(websocketAdapter);
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = configService.get<number>("PORT") || 3000;

  await app.listen(port, () => {
    logger.log(`Server up and running on port ${port}`);
  });
}
bootstrap();
