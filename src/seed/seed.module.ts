import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Permission } from '../roles/permission.entity';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';
import { Organization } from '../organizations/organization.entity';
import { Department } from '../departments/department.entity';
import { SeedController } from './seed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, Project, Task, Organization, Department])],
  providers: [SeedService],
  controllers: [SeedController],
  exports: [SeedService],
})
export class SeedModule {}
