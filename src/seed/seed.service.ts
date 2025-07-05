import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { Organization } from '../organizations/organization.entity';
import { Department } from '../departments/department.entity';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { ProjectStatus } from '../projects/enums/project-status.enum';
import { Role } from '../roles/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async generate() {
    this.logger.log('Seeding data started...');

    // 1 Organization
    const org = this.orgRepo.create({
      name: 'My Organization',
    });

    await this.orgRepo.save(org);

    const managerRole = await this.roleRepo.findOne({ where: { name: 'Manager' }});
    const employeeRole = await this.roleRepo.findOne({ where: { name: 'Employee' }});
    const hashedPassword =  await bcrypt.hash('P@ssw0rd!@#', 10);

    // Departments (around 100)
    const deptCount = 100;

    for (let i = 1; i <= deptCount; i++) {
      const dept = this.deptRepo.create({
        name: `Department ${i}`,
        organization: org,
      });

      await this.deptRepo.save(dept);

    const manager = this.userRepo.create({
        fullName: `Manager User ${dept.name} ${i}`,
        email: `manager@${dept.name + i}.com`,
        phone: `+96277809999${i}`,
        role: managerRole ?? {name: 'Manager'},
        organization: org,
        password: hashedPassword,
        departments: [dept]
    });

    await this.userRepo.save(manager);


    const employee = this.userRepo.create({
        fullName: `Employee User ${dept.name} ${i}`,
        email: `employee@${dept.name + i}.com`,
        phone: `+96277808888${i}`,
        role: employeeRole ?? {name: 'Employee'},
        organization: org,
        password: hashedPassword,
        departments: [dept]
    });

    await this.userRepo.save(employee);

      // Projects per department (random 50 to 80)
      const projectCount = this.randomInt(50, 80);

      for (let j = 1; j <= projectCount; j++) {
        const project = this.projectRepo.create({
          name: `Project ${j} of Dept ${i}`,
          departments: [dept],
          description: `Description for Project ${j} in Department ${i}`,
          status: ProjectStatus.OPEN,
          organization: org,
          manager: manager
        });

        await this.projectRepo.save(project);

        // Tasks per project (random 100 to 200)
        const taskCount = this.randomInt(100, 200);

        // Insert tasks in batches for performance
        const tasksBatch: any[] = [];
        for (let k = 1; k <= taskCount; k++) {
          let task = await this.taskRepo.create({
            title: `Task ${k} of Project ${j} in Dept ${i}`,
            description: `Description for Task ${k} in Department ${i}`,
            project: project,
            status: TaskStatus.TODO, 
            startDate: new Date(),
            endDate: this.randomFutureDate(),
            assignedTo: employee,
            department: dept
          });

          tasksBatch.push(task);
        }
        await this.taskRepo.save(tasksBatch);

        this.logger.log(`Seeded ${taskCount} tasks for Project ${j} of Department ${i}`);
      }

      this.logger.log(`Seeded ${projectCount} projects for Department ${i}`);
    }

    this.logger.log('Seeding data completed.');
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFutureDate(): Date {
    const today = new Date();
    const daysToAdd = this.randomInt(1, 90);
    return new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }
}
