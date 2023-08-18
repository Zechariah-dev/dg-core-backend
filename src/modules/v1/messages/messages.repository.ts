import { BaseRepository } from "../../../common/repositories/base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";
import { Message, MessageDocument } from "./schemas/message.schema";

export class MessagesRepository extends BaseRepository<MessageDocument> {
  constructor(
    @InjectModel(Message.name) private messagesModel: Model<MessageDocument>
  ) {
    super(messagesModel);
  }

  public async findOne(
    query: FilterQuery<MessageDocument>,
    projections?: any
  ): Promise<MessageDocument> {
    return this.messagesModel
      .findOne(query, projections)
      .populate([
        {
          path: "author",
          select: "fullname email image _id phone",
        },
        {
          path: "conversation",
          populate: [
            {
              path: "creator",
              select: "fullname email image _id phone",
            },
            {
              path: "recipient",
              select: "fullname email image _id phone",
            },
          ],
        },
      ])
      .lean();
  }

  public async find(
    query: FilterQuery<MessageDocument>,
    projections?: any,
    options?: QueryOptions<unknown>
  ): Promise<MessageDocument[]> {
    return this.messagesModel
      .find(query, projections, options)
      .populate([
        {
          path: "author",
          select: "fullname email image _id phone",
        },
        {
          path: "conversation",
        },
      ])
      .lean();
  }
}
