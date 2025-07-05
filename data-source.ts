import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity';
import { Role } from './src/roles/role.entity';
import { Permission } from './src/roles/permission.entity';
import { Department } from './src/departments/department.entity';
import { Task } from './src/tasks/task.entity';
import { Project } from './src/projects/project.entity';
import { Organization } from './src/organizations/organization.entity';
import { Notification } from './src/notifications/notification.entity';


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'hierarchy_db',
  entities: [User, Role, Permission, Department, Task, Project, Organization, Notification],  // <-- Glob pattern here
  migrations: [__dirname + '/src/migrations/*.ts'],
  synchronize: false,
});
