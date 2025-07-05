import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { TaskValidatorService } from './task-validator.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification } from '../notifications/notification.entity';
import { CacheService } from 'src/cache/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Organization, User, Project, Notification])],
  providers: [TasksService, TaskValidatorService, NotificationsService, CacheService],
  controllers: [TasksController],
  exports: [TasksService, TaskValidatorService],
})
export class TasksModule {}