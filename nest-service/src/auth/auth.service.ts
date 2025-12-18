import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

const bcryptLib = bcrypt as unknown as {
  compare(data: string, encrypted: string): Promise<boolean>;
  hash(data: string, rounds: number): Promise<string>;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    password: string,
  ): Promise<{ username: string; access_token: string }> {
    try {
      const user = await this.usersService.findByUsername(username);
      if (!user) {
        throw new UnauthorizedException('ไม่พบผู้ใช้หรือชื่อผู้ใช้ไม่ถูกต้อง');
      }

      const isPasswordValid = await bcryptLib.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('รหัสผ่านไม่ถูกต้อง');
      }

      const payload = { sub: user.id, username: user.username };

      return {
        access_token: await this.jwtService.signAsync(payload),
        username: user.username,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new ServiceUnavailableException('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    }
  }

  async register(createUserDto: CreateUserDto) {
    const passwordHash = await bcryptLib.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      username: createUserDto.username,
      password: passwordHash,
    });
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }
    if (updateUserDto.password) {
      user.password = await bcryptLib.hash(updateUserDto.password, 10);
    }
    return this.usersRepository.save(user);
  }
}
