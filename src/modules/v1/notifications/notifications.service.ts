import { Injectable } from "@nestjs/common";
import { NotificationsRepository } from "./notification.repository";
import { Types } from "mongoose";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository
  ) { }

  async findByUser(user: Types.ObjectId) {
    return this.notificationsRepository.find({ user, deletedAt: null });
  }

  async deleteOne(_id: Types.ObjectId, user: Types.ObjectId) {
    return this.notificationsRepository.softDelete({ _id, user });
  }

  async updateOne(_id: Types.ObjectId, user: Types.ObjectId) {
    return this.notificationsRepository.findOneAndUpdate({ _id, user }, { readAt: new Date() })
  }

  async read(_id: Types.ObjectId, user: Types.ObjectId) {
    return this.notificationsRepository.findOneAndUpdate({ _id, user }, { readAt: new Date() })
  }
}
