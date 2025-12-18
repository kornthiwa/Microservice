import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupApp } from './config/bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  setupApp(app, configService);

  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port);
}

void bootstrap();
