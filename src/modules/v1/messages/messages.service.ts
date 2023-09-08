import { Injectable, NotFoundException } from "@nestjs/common";
import { MessagesRepository } from "./messages.repository";
import { CreateMessageParams } from "./types";
import { ConversationsService } from "../conversations/conversations.service";
import { Types } from "mongoose";
import { UsersRepository } from "../users/users.repository";
import { use } from "passport";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly conversationsService: ConversationsService,
    private readonly usersRepository: UsersRepository,
    private readonly emitter: EventEmitter2
  ) {}

  async cronHandler() {
    try {
      const users = await this.usersRepository.find({
        role: { $not: "admin" },
      });

      for (const user of users) {
        const conversations = await this.conversationsService.getConversations(
          user.id,
          user.role
        );

        let unreadMessages = 0;

        for (const conversation of conversations) {
          const messages = await this.messagesRepository.count({
            conversation: conversation._id,
            author: { $not: user._id },
            unread: false,
          });

          unreadMessages += messages;
        }

        this.emitter.emit("notification", {
          user: user._id,
          title: "You have unread messages",
          body: `You have ${unreadMessages} messages awaiting your reply`,
        });
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

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
      lastMessageSentAt: new Date(),
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
