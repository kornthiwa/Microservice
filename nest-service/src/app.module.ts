import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // ระบุประเภทฐานข้อมูลเป็น PostgreSQL
        host: configService.getOrThrow<string>('DB_HOST'), // ที่อยู่ของ database server
        port: Number(configService.getOrThrow<string>('DB_PORT')), // port ของ database (5433 ตาม docker-compose.yml)
        username: configService.getOrThrow<string>('DB_USERNAME'), // ชื่อผู้ใช้ database
        password: configService.getOrThrow<string>('DB_PASSWORD'), // รหัสผ่าน database
        database: configService.getOrThrow<string>('DB_NAME'), // ชื่อฐานข้อมูล
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // ตำแหน่งของ entity files
        synchronize:
          configService.getOrThrow<string>('NODE_ENV') !== 'production', // สร้าง/อัปเดต tables อัตโนมัติ (ปิดใน production)
        logging: configService.getOrThrow<string>('NODE_ENV') === 'development', // แสดง SQL queries ในโหมด development
      }),
      inject: [ConfigService], // inject ConfigService เพื่อใช้ใน useFactory
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
