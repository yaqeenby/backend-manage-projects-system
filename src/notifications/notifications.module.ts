import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationWorker } from './notification.worker';
import { User } from '../users/user.entity';
import { CacheService } from '../cache/cache.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  providers: [NotificationsService, NotificationWorker, CacheService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
