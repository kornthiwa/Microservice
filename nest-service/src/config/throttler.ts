import { ThrottlerModuleOptions } from '@nestjs/throttler';

export function createThrottlerOptions(): ThrottlerModuleOptions {
  // สามารถอ่านค่าจาก env ผ่าน ConfigService ได้ภายหลังถ้าต้องการปรับแต่ง
  return {
    throttlers: [
      {
        ttl: 60_000,
        limit: 10,
      },
    ],
  };
}
