import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { RolesService } from './roles/roles.service';
import { PermissionsService } from './roles/permissions.service';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { Role } from './roles/role.entity';
import { Permission } from './roles/permission.entity';
import { Department } from './departments/department.entity';
import { Task } from './tasks/task.entity';
import { Project } from './projects/project.entity';
import { Organization } from './organizations/organization.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { PermissionModule, PermissionAction } from './roles/permissions.enum';
import { DepartmentModule } from './departments/department.module';
import { OrganizationModule } from './organizations/organization.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RedisModule } from './redis/redis.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/notification.entity';
import { CacheModule } from './cache/cache.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        migrationsRun: false,
        entities: [User, Role, Permission, Department, Task, Project, Organization, Notification]
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Department,
      Role,
      Permission,
      Task,
      Project,
      Organization,
      Notification
    ]),
    RolesModule,
    UsersModule,
    AuthModule,
    DepartmentModule,
    OrganizationModule,
    ProjectsModule,
    TasksModule,
    CacheModule,
    RedisModule,
    NotificationsModule,
    SeedModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    }
  ]
})

export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async onApplicationBootstrap() {
     const existingRoles = await this.rolesService.getAllRoles();
  if (existingRoles.length === 0) {
    console.log('⏳ Seeding initial roles and permissions...');

    const getPermission = (module: PermissionModule, action: PermissionAction) =>
      this.permissionsService.findOrCreate({ module, action });

    // Admin: كل الصلاحيات لكل Modules
    const adminPermissions = await Promise.all(
      Object.values(PermissionModule).flatMap((module) =>
        Object.values(PermissionAction).map((action) =>
          getPermission(module as PermissionModule, action as PermissionAction),
        ),
      ),
    );

    // Manager: صلاحيات محددة
    const managerPermissions = await Promise.all([
      getPermission(PermissionModule.PROJECT, PermissionAction.CREATE),
      getPermission(PermissionModule.PROJECT, PermissionAction.VIEW),
      getPermission(PermissionModule.PROJECT, PermissionAction.CREATE),
      getPermission(PermissionModule.PROJECT, PermissionAction.DELETE),

      getPermission(PermissionModule.TASK, PermissionAction.CREATE),
      getPermission(PermissionModule.TASK, PermissionAction.VIEW),
      getPermission(PermissionModule.TASK, PermissionAction.UPDATE),
      getPermission(PermissionModule.TASK, PermissionAction.DELETE),
    ]);

    // Employee: صلاحيات أقل
    const employeePermissions = await Promise.all([
      getPermission(PermissionModule.TASK, PermissionAction.CREATE),
      getPermission(PermissionModule.TASK, PermissionAction.VIEW),
      getPermission(PermissionModule.TASK, PermissionAction.UPDATE),
      getPermission(PermissionModule.TASK, PermissionAction.DELETE),
    ]);

    await this.rolesService.createRole('Admin', adminPermissions);
    await this.rolesService.createRole('Manager', managerPermissions);
    await this.rolesService.createRole('Employee', employeePermissions);

    console.log('✅ Initial roles and permissions seeded');
  } else {
    console.log('Roles already exist, skipping seeding');
  }


    const existingAdmin = await this.usersService.findByEmail('admin@test.com');
    if (!existingAdmin) {
      // هنا لازم تجيب دور Admin من قاعدة البيانات - مثال:
      const adminRole = await this.rolesService.getRoleByName('Admin');

      if (!adminRole) {
        throw new Error('Admin role not found in DB');
      }

      await this.usersService.create({
        email: 'admin@test.com',
        password: 'P@ssw0rd!@#',
        roleId: adminRole.id,
        fullName: 'Admin User',
        phone: '1234567890'
      }, null);
           
      console.log('✅ Default admin user created: admin@test.com / P@ssw0rd!@#');
    } else {
      console.log('Admin user already exists, skipping creation.');
    }

  }
}
