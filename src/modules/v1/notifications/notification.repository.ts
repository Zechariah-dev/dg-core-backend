import { BaseRepository } from "../../../common/repositories/base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Notification,
  NotificationDocument,
} from "./schemas/notification.schema";

export class NotificationsRepository extends BaseRepository<NotificationDocument> {
  constructor(
    @InjectModel(Notification.name)
    private notificationsModel: Model<NotificationDocument>
  ) {
    super(notificationsModel);
  }
}
