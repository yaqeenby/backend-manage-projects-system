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
import { SEED_SCALE } from '../config/constants';

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

    const org = this.orgRepo.create({ name: 'My Organization' });
    await this.orgRepo.save(org);

    const managerRole = await this.roleRepo.findOne({ where: { name: 'Manager' } });
    const employeeRole = await this.roleRepo.findOne({ where: { name: 'Employee' } });
    const hashedPassword = await bcrypt.hash('P@ssw0rd!@#', 10);

    const deptCount = this.scaleCount(100);
    const departments: Department[] = [];
    let tasks: Task[] = [];
    let managers: User[] = [];
    let employees: User[] = [];

    for (let i = 1; i <= deptCount; i++) {
      let dept = this.deptRepo.create({
        name: `Department ${i}`,
        organization: org,
      });

      departments.push(dept);

      managers.push(this.userRepo.create({
        fullName: `Manager User ${dept.name} ${i}`,
        email: `manager@${dept.name + i}.com`,
        phone: `+96277809999${i}`,
        role: managerRole as Role,
        organization: org,
        password: hashedPassword,
        departments: [dept],
      }));

      employees.push(this.userRepo.create({
        fullName: `Employee User ${dept.name} ${i}`,
        email: `employee@${dept.name + i}.com`,
        phone: `+96277808888${i}`,
        role: employeeRole as Role,
        organization: org,
        password: hashedPassword,
        departments: [dept],
      }));
    }

    await this.deptRepo.save(departments, { chunk: 100 });
    await this.userRepo.save([...managers, ...employees], { chunk: 100 });

    for (let i = 1; i <= deptCount; i++) {
      const dept = departments[i - 1];
      const manager = managers[i - 1];
      const employee = employees[i - 1];

      // const manager = this.userRepo.create({
      //   fullName: `Manager User ${dept.name} ${i}`,
      //   email: `manager@${dept.name + i}.com`,
      //   phone: `+96277809999${i}`,
      //   role: managerRole as Role,
      //   organization: org,
      //   password: hashedPassword,
      //   departments: [dept],
      // });

      // const employee = this.userRepo.create({
      //   fullName: `Employee User ${dept.name} ${i}`,
      //   email: `employee@${dept.name + i}.com`,
      //   phone: `+96277808888${i}`,
      //   role: employeeRole as Role,
      //   organization: org,
      //   password: hashedPassword,
      //   departments: [dept],
      // });

      // await this.userRepo.insert([manager, employee]);

      const projectCount = this.scaleCount(this.randomInt(50, 80));
      const deptProjects: Project[] = [];

      for (let j = 1; j <= projectCount; j++) {
        deptProjects.push(this.projectRepo.create({
          name: `Project ${j} of Dept ${i}`,
          departments: [dept],
          description: `Description for Project ${j} in Department ${i}`,
          status: ProjectStatus.OPEN,
          organization: org,
          manager: manager,
        }));
      }

      const savedProjects = await this.projectRepo.save(deptProjects, { chunk: 100 });

      for (let j = 0; j < savedProjects.length; j++) {
        const project = savedProjects[j];
        const taskCount = this.scaleCount(this.randomInt(100, 200));

        for (let k = 1; k <= taskCount; k++) {
          tasks.push(this.taskRepo.create({
            title: `Task ${k} of Project ${j + 1} in Dept ${i}`,
            description: `Description for Task ${k} in Department ${i}`,
            project: project,
            status: TaskStatus.TODO,
            startDate: new Date(),
            endDate: this.randomFutureDate(),
            assignedTo: employee,
            department: dept,
          }));
        }
        
        if(tasks.length >= 1000) {
           await this.taskRepo.save(tasks, { chunk: 1000 });
           tasks = [];
        }

        this.logger.log(`Seeded ${taskCount} tasks for Project ${j + 1} of Department ${i}`);
      }

      this.logger.log(`Seeded ${projectCount} projects for Department ${i}`);
    }

    this.logger.log('Seeded last tasks.');
    if(tasks && tasks.length > 0) {
      await this.taskRepo.save(tasks, { chunk: 1000 });
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

  private scaleCount(base: number): number {
    return Math.floor(base * SEED_SCALE);
  }
}
