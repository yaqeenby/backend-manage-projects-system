import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Department } from '../departments/department.entity';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';
import { DepartmentModule } from '../departments/department.module';
import { ProjectValidatorService } from './project-validator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Department, Organization, User, Task]),
    DepartmentModule
  ],
  providers: [ProjectsService, ProjectValidatorService],
  controllers: [ProjectsController],
  exports: [ProjectsService, ProjectValidatorService],
})
export class ProjectsModule {}