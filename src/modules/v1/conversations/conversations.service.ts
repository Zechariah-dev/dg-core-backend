import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConversationRepository } from "./conversation.repository";
import { Types } from "mongoose";
import { createConversationDto } from "./dtos/create-conversation.dto";
import { UsersRepository } from "../users/users.repository";
import { User } from "../users/schemas/user.schema";
import { MessagesRepository } from "../messages/messages.repository";

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly usersRepository: UsersRepository,
    private readonly messagesRepository: MessagesRepository
  ) {}

  async getConversations(id: Types.ObjectId) {
    return this.conversationRepository.find({
      $or: [{ recipient: id }, { creator: id }],
    });
  }

  async findById(_id: Types.ObjectId) {
    return this.conversationRepository.findOne({ _id });
  }

  async create(creator: User, params: createConversationDto) {
    const recipient = await this.usersRepository.findOne({
      _id: params.reciepentId,
    });
    if (!recipient) {
      throw new NotFoundException("Reciepent does not exist");
    }

    if (creator._id.toString() === recipient._id.toString()) {
      throw new BadRequestException(
        "You cannot create conversation with yourself"
      );
    }

    const conversationExists = await this.isCreated(creator._id, recipient._id);
    if (conversationExists) {
      throw new BadRequestException("Conversation already in existence");
    }

    const conversation = await this.conversationRepository.create({
      creator: creator._id,
      reciepient: recipient._id,
    });
    const message = await this.messagesRepository.create({
      content: params.content,
      author: creator._id,
      conversation: conversation._id,
    });

    return conversation;
  }

  async isCreated(creator: Types.ObjectId, recipient: Types.ObjectId) {
    return this.conversationRepository.findOne({ creator, recipient });
  }
}
