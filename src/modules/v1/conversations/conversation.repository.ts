import { BaseRepository } from "src/common/repositories/base.repository";
import {
  Conversation,
  ConversationDocument,
} from "./schemas/conversation.schema";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";

export class ConversationRepository extends BaseRepository<ConversationDocument> {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>
  ) {
    super(conversationModel);
  }

  public findOne(
    query: FilterQuery<ConversationDocument>,
    projections?: any
  ): Promise<ConversationDocument> {
    return this.conversationModel
      .findOne(query, projections)
      .populate([
        {
          path: "creator",
          select: "image fullname phone _id email",
        },
        {
          path: "recipient",
          select: "image fullname phone _id email",
        },
      ])
      .lean();
  }

  public async find(
    query: FilterQuery<ConversationDocument>,
    projections?: any,
    options?: QueryOptions<unknown>
  ): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find(query, projections, options)
      .sort("-lastMessageSentAt")
      .populate([
        {
          path: "creator",
          select: "image fullname phone _id email",
        },
        {
          path: "recipient",
          select: "image fullname phone _id email",
        },
      ])
      .lean();
  }
}
