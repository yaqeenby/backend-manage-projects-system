import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { NotificationTargetType } from './enums/notification-target-type.enum';
import { NotificationActionType } from './enums/notification-action-type.enum';
import { User } from '../users/user.entity';

@Entity()
export class Notification extends BaseEntity {
  @Column({ type: 'enum', enum: NotificationTargetType })
  entityType: NotificationTargetType;

  @Column()
  entityId: string;

  @Column({ type: 'enum', enum: NotificationActionType })
  action: NotificationActionType;

  @Column({ type: 'enum', enum: NotificationTargetType })
  targetType: NotificationTargetType;

  @Column()
  targetId: string;

  @Column({ default: false })
  isProcessed: boolean;

  @ManyToMany(() => User, (user) => user.notifications, { eager: true })
  @JoinTable()
  users: User[];
}

