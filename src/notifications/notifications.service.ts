import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { AuthUser } from '../auth/types/auth-user.type';
import { CacheService } from '../cache/cache.service';
import { groupNotifications } from './utils/group-notifications';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
    private readonly cacheService: CacheService
  ) {}

  async create(data: Partial<Notification>, currentUser: AuthUser) {
    const entity = this.notifRepo.create({
      ...data,
      createdBy: currentUser.userId,
      updatedBy: currentUser.userId
    });

    const notif = await this.notifRepo.save(entity);
    this.cacheService.set(`notification:${notif.id}`, notif);
    
    return notif;
  }

  async findAll() {
    return this.notifRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getUserNotifications(userId: string) {
    const notifications = await this.notifRepo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.users', 'u')
      .where('u.id = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .getMany();

    const groups = groupNotifications(notifications);
    const messages: any = [];

    for (const [userId, group] of Object.entries(groups)) {
      for (const msg of group.messages) {
        messages.push({message: msg});
      }
    }

      return messages;
  }

  async setProcessedNotification(ids: string[]) {
    const entity = await this.notifRepo.update(ids, { isProcessed: true })

    this.cacheService.clearMultiple(ids.map(id => `notification:${id}`));

    return entity;
  }
}
