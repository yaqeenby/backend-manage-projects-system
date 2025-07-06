import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Permission } from './permission.entity';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from '../users/user.entity';

@Entity()
export class Role extends BaseEntity{
  @Column({ unique: true })
  name: string; // Admin, Manager, Employee, etc.

  @ManyToMany(() => Permission, (permission) => permission.roles, { cascade: true, eager: true })
  @JoinTable() 
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
