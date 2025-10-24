import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';

export enum RoleType {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  SCORER = 'scorer',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RoleType,
    unique: true,
  })
  name: RoleType;

  @Column({ length: 255, nullable: true })
  description: string;

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
