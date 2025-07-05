import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Organization } from 'src/organizations/organization.entity';

@Injectable()
export class DepartmentValidatorService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,

    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
  ) {}

  async validate(dto: CreateDepartmentDto): Promise<void> {
    const errors: string[] = [];
    
    if (dto.organizationId) {
      const organization = await this.organizationRepo.findOne({ where: { id: dto.organizationId } });
      if (!organization) 
            errors.push('Invalid Organization');

      const departments = await this.departmentRepo.find({ where: {name: dto.name?.trim(), organizationId: dto.organizationId } });
      if (departments && departments.length > 0) {
            errors.push('Department Name dupplicated in this Organization');
      }
    }

    if (errors.length) {
      throw new BadRequestException(errors);
    }
  }
}
