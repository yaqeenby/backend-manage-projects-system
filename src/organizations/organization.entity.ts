// src/organizations/organization.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { Department } from '../departments/department.entity';
import { BaseEntity } from '../common/entities/base.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Entity()
export class Organization extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Department, (department) => department.organization)
  departments: Department[];

  @OneToMany(() => Project, (project) => project.organization)
  projects: Project[];

  @OneToMany(() => User, (user) => user.organization)
   users: User[];
}
