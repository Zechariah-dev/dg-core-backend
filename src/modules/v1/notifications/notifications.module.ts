import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { MongooseModule } from "@nestjs/mongoose";
import {
  NotificationSchema,
  Notification,
} from "./schemas/notification.schema";
import { NotificationsRepository } from "./notification.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule { }
