import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum Role {
  User = 'user',
  Admin = 'admin',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column('simple-array', { default: Role.User })
  roles: Role[];
}
