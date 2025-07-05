import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { TaskValidatorService } from './task-validator.service';
import { AuthUser } from '../auth/types/auth-user.type';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTargetType } from 'src/notifications/enums/notification-target-type.enum';
import { NotificationActionType } from 'src/notifications/enums/notification-action-type.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    private readonly taskValidator: TaskValidatorService,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(dto: CreateTaskDto, currentUser: AuthUser): Promise<Task> {
    await this.taskValidator.validate(dto);

    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      project: { id: dto.projectId } as Project,
      assignedTo: { id: dto.assignedToUserId } as User,
      createdBy: currentUser.userId,
      updatedBy: currentUser.userId
    });

    await this.taskRepo.save(task);

    const createdTask = await this.taskRepo.findOne({ where: { id: task.id }});

    if(createdTask) {
      await this.notificationsService.create({
      entityId: createdTask.id,
      entityType: NotificationTargetType.TASK,
      action: NotificationActionType.CREATE,
      targetId: createdTask.project.id,
      targetType: NotificationTargetType.PROJECT,
      users: [createdTask.project.manager, createdTask.assignedTo]
      }, currentUser);
    }
    return createdTask ?? task;
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepo.find();
  }

  async update(id: string, dto: CreateTaskDto, currentUser: AuthUser): Promise<Task> {
    const updatedTask = await this.taskRepo.findOneByOrFail({ id });
    await this.taskValidator.validate(dto);

    await this.taskRepo.save({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      project: { id: dto.projectId } as Project,
      assignedTo: { id: dto.assignedToUserId } as User,
      updatedBy: currentUser?.userId
    })

     if(updatedTask) {
      await this.notificationsService.create({
      entityId: updatedTask.id,
      entityType: NotificationTargetType.TASK,
      action: NotificationActionType.UPDATE,
      targetId: updatedTask.project.id,
      targetType: NotificationTargetType.PROJECT,
      users: [updatedTask.project.manager, updatedTask.assignedTo]
      }, currentUser);
    }

    return updatedTask;
  }
}
