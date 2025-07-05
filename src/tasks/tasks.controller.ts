import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionAction, PermissionModule } from '../roles/permissions.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Permissions(`${PermissionModule.TASK}.${PermissionAction.CREATE}`)
  @Post('create')
  create(@Body() dto: CreateTaskDto, @CurrentUser() currentUser: AuthUser) {
    return this.taskService.create(dto, currentUser);
  }

  @Permissions(`${PermissionModule.TASK}.${PermissionAction.VIEW}`)
  @Get('list')
  findAll() {
    return this.taskService.findAll();
  }

  @Permissions(`${PermissionModule.TASK}.${PermissionAction.UPDATE}`)
  @Post('update/:id')
  update(@Param('id') id: string, dto: CreateTaskDto, @CurrentUser() currentUser: AuthUser) {
    return this.taskService.update(id, dto, currentUser);
  }
}
