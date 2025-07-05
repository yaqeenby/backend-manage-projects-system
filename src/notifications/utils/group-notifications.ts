import { NotificationType } from '../types/notification.type';
import { NotificationsGroupeType } from '../types/notifications-group.type';

export function groupNotifications(notifications: NotificationType[], targetUserId?: string): Record<string, NotificationsGroupeType> {
  const userGroups: Record<string, Record<string, {
    count: number,
    targetId: string | null,
    targetType: string | null,
    notificationIds: string[]
  }>> = {};

  for (const notif of notifications) {
    const users = targetUserId
      ? notif.users.filter(u => u.id === targetUserId)
      : notif.users;

    for (const user of users) {
      const userId = user.id;
      const key = `${notif.action}:${notif.entityType}:${notif.targetId ?? 'null'}`;

      if (!userGroups[userId]) userGroups[userId] = {};
      if (!userGroups[userId][key]) {
        userGroups[userId][key] = {
          count: 0,
          targetId: notif.targetId,
          targetType: notif.targetType,
          notificationIds: []
        };
      }

      userGroups[userId][key].count += 1;
      userGroups[userId][key].notificationIds.push(notif.id);
    }
  }

  const result: Record<string, NotificationsGroupeType> = {};

  for (const [userId, actions] of Object.entries(userGroups)) {
    const messages: string[] = [];
    const notificationIds: string[] = [];

    for (const [key, data] of Object.entries(actions)) {
      const [action, entityType] = key.split(':');
      const targetText = data.targetId && data.targetType
        ? ` in ${data.targetType} "${data.targetId}"`
        : '';
      messages.push(`${action} ${data.count} ${entityType}${targetText}`);
      notificationIds.push(...data.notificationIds);
    }

    result[userId] = {
      messages,
      notificationIds,
      isSuccess: false,
    };
  }

  return result;
}
