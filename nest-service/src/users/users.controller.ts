import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
