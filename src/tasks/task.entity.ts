import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { TaskStatus } from './enums/task-status.enum';
import { Department } from '../departments/department.entity';

@Entity()
export class Task extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @ManyToOne(() => Project, (project) => project.tasks, { eager: true })
  project: Project;

  @ManyToOne(() => User, (user) => user.assignedTasks, { eager: true, nullable: true })
  assignedTo: User;

  @ManyToOne(() => Department, { nullable: true })
  department: Department;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;
}