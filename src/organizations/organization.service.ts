import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './organization.entity';
import { Not, Repository } from 'typeorm';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthUser } from '../auth/types/auth-user.type';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepo: Repository<Organization>,
  ) {}

  async create(dto: CreateOrganizationDto, currentUser: AuthUser): Promise<Organization> {
    const exists = await this.organizationRepo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new BadRequestException('Organization name already exists');
    }
    
    const organization = this.organizationRepo.create({
      ...dto,
      createdBy: currentUser.userId,
      updatedBy: currentUser.userId
    });

    return this.organizationRepo.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepo.find();
  }

  async update(id: string, dto: UpdateOrganizationDto, currentUser: AuthUser): Promise<Organization> {
    const org = await this.organizationRepo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');

    if (dto.name) {
      const existing = await this.organizationRepo.findOne({
        where: {
          name: dto.name,
          id: Not(id), // exclude self
        },
      });
      if (existing) {
        throw new BadRequestException('Organization name must be unique');
      }
      org.name = dto.name;
    }

    org.updatedBy = currentUser.userId;
    return await this.organizationRepo.save(org);
  }
}
