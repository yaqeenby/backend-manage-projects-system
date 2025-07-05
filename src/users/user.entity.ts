import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable
  } from 'typeorm';
  
  import { Task } from '../tasks/task.entity';
  import { Department } from '../departments/department.entity';
  import { Role } from '../roles/role.entity';
  import { BaseEntity } from '../common/entities/base.entity';
  import { Project } from '../projects/project.entity';
  import { Organization } from '../organizations/organization.entity';
  import { Notification } from '../notifications/notification.entity';

  @Entity()
  export class User extends BaseEntity {
    @Column()
    fullName: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    phone: string;

    @Column()
    password: string;
  
    @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: false })
    role: Role;
  
    @ManyToMany(() => Department, (dept) => dept.users, { eager: true })
    @JoinTable()
    departments: Department[];
  
    @OneToMany(() => Task, (task) => task.assignedTo)
    assignedTasks: Task[];

    @OneToMany(() => Project, (project) => project.manager)
    managedProjects: Project[];

    @ManyToOne(() => Organization, (org) => org.users, { nullable: true })
    organization: Organization;
    
    @ManyToMany(() => Notification, (notification) => notification.users)
    notifications: Notification[];
  }
  