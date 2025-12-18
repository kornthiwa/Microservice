import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const helmetFactory =
    helmet as unknown as () => import('express').RequestHandler;
  app.use(helmetFactory());

  const cookieParserFactory =
    cookieParser as unknown as () => import('express').RequestHandler;
  app.use(cookieParserFactory());

  // CSRF protection (double submit cookie)
  const csrfSecret = process.env.CSRF_SECRET ?? 'change-this-csrf-secret';
  const doubleCsrfOptions = {
    getSecret: () => csrfSecret,
    cookieName: 'x-csrf-token',
    cookieOptions: {
      sameSite: 'strict' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
    getTokenFromRequest: (req: import('express').Request) =>
      (req.headers['x-csrf-token'] as string | undefined) ?? '',
  };

  const doubleCsrfFactory = doubleCsrf as unknown as (
    options: typeof doubleCsrfOptions,
  ) => {
    doubleCsrfProtection: import('express').RequestHandler;
  };

  const { doubleCsrfProtection } = doubleCsrfFactory(doubleCsrfOptions);
  app.use(doubleCsrfProtection);

  app.enableCors({
    origin: [
      'http://localhost:3000', // frontend ตอน dev
      'https://nest-service.com', // domain จริงบนโปรดักชัน
    ],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
