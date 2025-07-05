// src/departments/department.entity.ts
import { Entity, Column, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';
import { Organization } from '../organizations/organization.entity'; // بنجهزه بعد شوي
import { Project } from '../projects/project.entity';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from '../users/user.entity';

@Entity()
export class Department extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(() => Project, (project) => project.departments)
  projects: Project[];

  @ManyToMany(() => User, (user) => user.departments)
  users: User[];

  @ManyToOne(() => Organization, (org) => org.departments, { eager: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: string;
}
