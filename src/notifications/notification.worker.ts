import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { NotificationsService } from './notifications.service';
import { Inject } from '@nestjs/common';
import { NotificationType } from './types/notification.type';
import { groupNotifications } from './utils/group-notifications';

@Injectable()
export class NotificationWorker {
  private readonly logger = new Logger(NotificationWorker.name);
  private interval: NodeJS.Timeout;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly notificationService: NotificationsService,
  ) {}

  onModuleInit() {
    this.interval = setInterval(() => this.processBufferedNotifications(), 60 * 1000);
  }

  async processBufferedNotifications() {
  const notifications = await this.getAllBufferedNotifications();

  if(notifications && notifications.length > 0) {
    const grouped = groupNotifications(notifications);
    let successfulNotifIds = new Set<string>();
    let pendingNotifIds = new Set<string>();

    for (const [userId, group] of Object.entries(grouped)) {
      console.log(`To ${userId}:`);
      for (const msg of group.messages) {
        console.log(` - ${msg}`);
      }

      const success = true; // Replace with actual send result
      if (success) {
        group.isSuccess = true;
        group.notificationIds.forEach(id => successfulNotifIds.add(id));
      }
    }

    for (const [userId, group] of Object.entries(grouped)) {
      if (!group.isSuccess) {
        group.notificationIds.forEach(id => pendingNotifIds.add(id));
      }
    }
    
    const successNotifications = Array.from(successfulNotifIds).filter(id => !pendingNotifIds.has(id));

    if(successNotifications && successNotifications.length > 0) {
      await this.notificationService.setProcessedNotification(successNotifications);
    }
  }
  }

  async getAllBufferedNotifications(): Promise<NotificationType[]> {
    const pattern = 'notification:*';
    const keys = await this.redis.keys(pattern);

    const allNotifications: NotificationType[] = [];

    for (const key of keys) {
      const rawList = await this.redis.lrange(key, 0, -1);
      const parsed = rawList.map((item) => {
        try {
          return JSON.parse(item);
        } catch (e) {
          this.logger.warn(`Failed to parse notification from Redis key ${key}`);
          return null;
        }
      }).filter(Boolean); // remove null

      allNotifications.push(...parsed);
    }

    return allNotifications;
  }
}
