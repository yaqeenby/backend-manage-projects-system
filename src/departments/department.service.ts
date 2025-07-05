import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentValidatorService } from './department-validator.service';
import { AuthUser } from '../auth/types/auth-user.type';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    private readonly departmentValidator: DepartmentValidatorService
  ) {}

  async create(dto: CreateDepartmentDto, currentUser: AuthUser): Promise<Department> {
    await this.departmentValidator.validate(dto);
    
    const department = this.departmentRepo.create({
      ...dto,
      createdBy: currentUser.userId,
      updatedBy: currentUser.userId
    });
    
    return this.departmentRepo.save(department);
  }

  findAll(): Promise<Department[]> {
    return this.departmentRepo.find({ relations: ['users'] });
  }

  findById(id: string): Promise<Department | null> {
    return this.departmentRepo.findOne({ where: { id }, relations: ['users'] });
  }

  async update(id: string, dto: CreateDepartmentDto, currentUser: AuthUser): Promise<Department> {
    const department = await this.departmentRepo.findOneByOrFail({ id });
    department.name = dto.name;

    await this.departmentValidator.validate(dto);
    
    if (dto.organizationId) {
      department.organizationId = dto.organizationId;
    }
    
    department.updatedBy = currentUser.userId;

    return this.departmentRepo.save(department);
  }

  async remove(id: string): Promise<void> {
    await this.departmentRepo.delete(id);
  }
}
