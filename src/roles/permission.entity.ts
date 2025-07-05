// src/roles/permission.entity.ts
import { Entity, Column, Unique, ManyToMany } from 'typeorm';
import { Role } from './role.entity';
import { BaseEntity } from '../common/entities/base.entity';

@Entity()
@Unique(['module', 'action'])  // ضمان عدم تكرار نفس الmodule و action مع بعض
export class Permission extends BaseEntity {
  @Column()
  module: string;

  @Column()
  action: string; 

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
