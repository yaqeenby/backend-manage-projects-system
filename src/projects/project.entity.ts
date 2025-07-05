import { Entity, Column, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Task } from '../tasks/task.entity';
import { Department } from '../departments/department.entity';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { ProjectStatus } from './enums/project-status.enum';

@Entity()
export class Project extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.OPEN })
  status: ProjectStatus;

  @ManyToOne(() => Organization, (org) => org.projects)
  organization: Organization;

  @ManyToOne(() => User, (user) => user.managedProjects, { eager: true })
  manager: User;

  @ManyToMany(() => Department, (dept) => dept.projects, { eager: true })
  @JoinTable()
  departments: Department[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}