import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("my")
  async getMyNotifications(@CurrentUser() currentUser: AuthUser) {
    return this.notificationsService.getUserNotifications(currentUser.userId);
  }
}
