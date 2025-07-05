import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Department } from '../departments/department.entity';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProjectValidatorService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
  ) {}

  private throwValidationError(message: string | string[]): never {
    throw new HttpException(
      {
        data: null,
        errorCode: 400,
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  async validate(dto: CreateProjectDto | UpdateProjectDto): Promise<void> {
    const errors: string[] = [];

    const org = await this.orgRepo.findOne({ where: { id: dto.organizationId } });
    if (!org) this.throwValidationError('Invalid organizationId');

    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        errors.push('Invalid date format');
      } else if (start >= end) {
        errors.push('startDate must be before endDate');
      }
    }

    if (dto.managerId) {
      const manager = await this.userRepo.findOne({
        where: { id: dto.managerId },
        relations: ['role', 'organization'],
      });

      if (!manager) {
        errors.push('Invalid managerId');
      } else {
        if (manager.role?.name !== 'Manager') {
          errors.push('managerId must be a Manager');
        }
        if (manager.organization?.id !== dto.organizationId) {
          errors.push('Manager must belong to the same organization');
        }
      }
    }

    if (dto.departmentsIds?.length) {
      const departments = await this.deptRepo.findByIds(dto.departmentsIds);

      if (departments.length !== dto.departmentsIds.length) {
        errors.push('One or more departmentIds are invalid');
      }

      const invalidOrgDepartments = departments.filter(
        (d) => d.organizationId !== dto.organizationId,
      );
      if (invalidOrgDepartments.length > 0) {
        errors.push('All departments must belong to the same organization');
      }
    }

    if (errors.length) this.throwValidationError(errors);
  }
}
