import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';

export function setupApp(app: INestApplication, configService: ConfigService) {
  // Security middlewares: ป้องกัน header / common attack (XSS, clickjacking )
  const helmetFactory =
    helmet as unknown as () => import('express').RequestHandler;
  app.use(helmetFactory());

  const cookieParserFactory =
    cookieParser as unknown as () => import('express').RequestHandler;
  app.use(cookieParserFactory());

  // CSRF protection (double submit cookie): ป้องกันการยิงคำขอจากไซต์อื่น
  // โดยใช้ค่า token ใน cookie จับคู่กับ header ที่ client ต้องส่งมาด้วย
  const csrfSecret =
    configService.get<string>('CSRF_SECRET') ?? 'change-this-csrf-secret';
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';

  const doubleCsrfOptions = {
    getSecret: () => csrfSecret,
    cookieName: 'x-csrf-token',
    cookieOptions: {
      sameSite: 'strict' as const,
      secure: nodeEnv === 'production',
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

  // CORS: กำหนดว่าต้นทาง (frontend domains) ไหนที่อนุญาตให้เรียก API ได้
  // อ่านจาก CORS_ORIGINS (คั่นด้วย comma) ถ้าไม่เซ็ตจะใช้ค่า default ด้านล่าง
  const corsOriginsEnv = configService.get<string>('CORS_ORIGINS');
  const defaultOrigins = ['http://localhost:3000', 'https://nest-service.com'];
  const origins = corsOriginsEnv
    ? corsOriginsEnv.split(',').map((o) => o.trim())
    : defaultOrigins;

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  // Global validation pipe: ใช้ class-validator/class-transformer ตรวจและแปลง input ทุก request
  // - whitelist: รับเฉพาะ field ที่ประกาศไว้ใน DTO
  // - forbidNonWhitelisted: ถ้ามี field แปลก ๆ ที่ไม่อยู่ใน DTO ให้ error ทันที
  // - transform: แปลงประเภทข้อมูล (เช่น string -> number) ตาม type ของ DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
