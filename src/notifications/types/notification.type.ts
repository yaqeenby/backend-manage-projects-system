export type NotificationType = {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  users: any[];
};