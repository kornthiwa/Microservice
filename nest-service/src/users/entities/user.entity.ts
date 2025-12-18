import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  User = 'user',
  Admin = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column('simple-array', { default: Role.User })
  roles: Role[];
}
