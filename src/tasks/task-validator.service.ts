import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Injectable()
export class TaskValidatorService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async validate(dto: CreateTaskDto): Promise<void> {
    const errors: string[] = [];

    // 1. Validate Dates
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (start >= end) {
      errors.push('startDate must be before endDate');
    }

    // 2. Validate Project
    const project = await this.projectRepo.findOne({
      where: { id: dto.projectId },
      relations: ['organization'], 
    });
    if (!project) {
      errors.push('Invalid projectId');
    }

    // 3. Validate Assigned User
    const user = await this.userRepo.findOne({
      where: { id: dto.assignedToUserId },
      relations: ['organization'],
    });
    if (!user) {
      errors.push('Invalid assignedToUserId');
    }

    // 4. Check if user belongs to same organization of the project
    if (project && user && project.organization?.id !== user.organization?.id) {
      errors.push('Assigned user must belong to the same organization as the project');
    }

    if (errors.length) {
      throw new BadRequestException(errors);
    }
  }
}
