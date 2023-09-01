import { Injectable, NotFoundException } from "@nestjs/common";
import { MessagesRepository } from "./messages.repository";
import { CreateMessageParams } from "./types";
import { ConversationsService } from "../conversations/conversations.service";
import { Types } from "mongoose";

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly conversationsService: ConversationsService
  ) {}

  async create(params: CreateMessageParams) {
    let conversation = await this.conversationsService.findById(
      params.conversation
    );

    if (!conversation) {
      throw new NotFoundException("Conversation does not exist");
    }
    const message = await this.messagesRepository.create(params);
    conversation = await this.conversationsService.updateOne(conversation._id, {
      lastMessageSent: message._id,
      lastMessageSentAt: new Date()
    });

    return { message, conversation };
  }

  getMessages(conversation: Types.ObjectId) {
    return this.messagesRepository.find({ conversation }, null, {
      sort: "createdAt",
      populate: [
        {
          path: "author",
          select: "fullname _id  email phone image",
        },
      ],
    });
  }
}
