import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Role } from 'src/roles/role.entity';
import { Department } from 'src/departments/department.entity';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Organization } from 'src/organizations/organization.entity';

@Injectable()
export class UserValidatorService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Department) private readonly deptRepo: Repository<Department>,
    @InjectRepository(Organization) private readonly organizationRepo: Repository<Organization>,
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

  async validate(dto: CreateUserDto | UpdateUserDto, isUpdate = false, userId?: string): Promise<void> {
    const errors: string[] = [];

    if (dto.email) {
      const existingEmail = await this.userRepo.findOne({
        where: {
          email: dto.email,
          ...(isUpdate && userId ? { id: Not(userId) } : {}),
        },
      });
      if (existingEmail) errors.push('Email is already taken');
    }

    if (dto.phone) {
      const existingPhone = await this.userRepo.findOne({
        where: {
          phone: dto.phone,
          ...(isUpdate && userId ? { id: Not(userId) } : {}),
        },
      });
      if (existingPhone) errors.push('Phone number is already used');
    }

    if (dto.roleId) {
      const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
      if (!role) errors.push('Invalid roleId');
    }

    if (dto.organizationId) {
      const organization = await this.organizationRepo.findOne({ where: { id: dto.organizationId } });
      if (!organization) errors.push('Invalid organizationId');
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
