import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      username: createUserDto.username,
      password: passwordHash,
    });
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByUsername(username: string) {
    return this.usersRepository.findOne({ where: { username } });
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
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    await this.usersRepository.delete(id);
    return { deleted: true };
  }
}
