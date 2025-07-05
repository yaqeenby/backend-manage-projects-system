import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Department } from '../departments/department.entity';
import { ProjectValidatorService } from './project-validator.service';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { AuthUser } from '../auth/types/auth-user.type';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    private readonly projectValidator: ProjectValidatorService
  ) {}

  async create(dto: CreateProjectDto, currentUser: AuthUser): Promise<Project> {
    await this.projectValidator.validate(dto);

    const exists = await this.projectRepo.findOne({ where: { name: dto.name } });
      if (exists) {
        throw new BadRequestException('Project name already exists');
    }
    const project = this.projectRepo.create({
      ...dto,
      organization: {id: dto.organizationId} as Organization,
      manager: {id: dto.managerId} as User,
      departments: dto.departmentsIds?.map(d => ({id: d} as Department)),
      createdBy: currentUser.userId,
      updatedBy: currentUser.userId
    });
    return await this.projectRepo.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepo.find({ relations: ['tasks'] });
  }

  async update(id: string, dto: UpdateProjectDto, currentUser: AuthUser): Promise<Project> {
    //prevevnt edit this data (based on requirments)
    var project = await this.projectRepo.findOneByOrFail({ id });

    dto.departmentsIds = undefined;
    dto.organizationId = undefined;

    await this.projectValidator.validate({
      ...dto,
      organizationId: project.organization?.id
    });



    if (dto.name) {
      const existing = await this.projectRepo.findOne({where: { name: dto.name, id: Not(id) }});
      if (existing) {
        throw new BadRequestException('Project name must be unique');
      }
      project.name = dto.name;
    }

    if (dto.description) project.description = dto.description;

    // if(dto.departmentsIds && dto.departmentsIds.length > 0) {
    //   project = Object.assign(project, { departments: dto.departmentsIds?.map(d => ({id: d} as Department)) });
    // }

    // if(dto.organizationId) {
    //   project = Object.assign(project, { organization: {id: dto.organizationId} as Organization });
    // }

    if(dto.managerId) {
      project = Object.assign(project, { manager: {id: dto.managerId} as User });
    }

    if (dto.status) project.status = dto.status;

    project.updatedBy = currentUser.userId;
    
    return this.projectRepo.save(project);
  }
}

