import { Controller, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @Post()
  async seed() {
    await this.seedService.generate();
    return { message: 'Seed data generated' };
  }
}
