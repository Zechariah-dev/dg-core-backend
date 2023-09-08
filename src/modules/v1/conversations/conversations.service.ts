import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConversationRepository } from "./conversation.repository";
import { UpdateQuery, Types } from "mongoose";
import { createConversationDto } from "./dtos/create-conversation.dto";
import { UsersRepository } from "../users/users.repository";
import { User } from "../users/schemas/user.schema";
import { MessagesRepository } from "../messages/messages.repository";
import { Conversation } from "./schemas/conversation.schema";
import { ObjectId } from "mongodb";

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly usersRepository: UsersRepository,
    private readonly messagesRepository: MessagesRepository
  ) {}

  async getConversations(id: Types.ObjectId, role: string, search?: string) {
    const aggregation: Array<any> = [
      {
        $match: {
          $or: [
            {
              creator: new ObjectId(id),
            },
            {
              recipient: new ObjectId(id),
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "recipient",
          foreignField: "_id",
          as: "recipient",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: {
          path: "$recipient",
        },
      },
      {
        $unwind: {
          path: "$creator",
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          "recipient.fullname": 1,
          "recipient.image": 1,
          "recipient._id": 1,
          "recipient.email": 1,
          "recipient.phone": 1,
          "creator.fullname": 1,
          "creator.image": 1,
          "creator._id": 1,
          "creator.email": 1,
          "creator.phone": 1,
        },
      },
    ];

    // search conversation based on the user role and search query
    if (search && role === "creator") {
      const searchRegex = new RegExp(search, "i");

      const matchQuery = {
        $or: [
          { "recipient.fullname": { $regex: searchRegex } },
          { "recipient.email": { $regex: searchRegex } },
        ],
      };

      aggregation.push({ $match: matchQuery });
    }

    // search conversation based on the user role and search query
    if (search && role === "consumer") {
      const searchRegex = new RegExp(search, "i");

      const matchQuery = {
        $or: [
          { "creator.fullname": { $regex: searchRegex } },
          { "creator.email": { $regex: searchRegex } },
        ],
      };

      aggregation.push({ $match: matchQuery });
    }

    const conversations = await this.conversationRepository.aggregate(
      aggregation
    );

    const refinedData = Promise.all(
      conversations.map(async (conversation) => {
        // count the number of the unread messages by conversation
        const unreadMessages = await this.messagesRepository.count({
          conversation: conversation._id,
          author: { $ne: id },
          unread: true,
        });

        return { ...conversation, unreadMessages };
      })
    );

    return refinedData;
  }

  async findById(_id: Types.ObjectId) {
    return this.conversationRepository.findOne({ _id });
  }

  async create(creator: User, params: createConversationDto) {
    const recipient = await this.usersRepository.findOne({
      _id: params.recipientId,
    });
    if (!recipient) {
      throw new NotFoundException("Recipient does not exist");
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
      recipient: recipient._id,
    });

    await this.messagesRepository.create({
      content: params.content,
      author: creator._id,
      conversation: conversation._id,
    });

    return conversation;
  }

  async isCreated(creator: Types.ObjectId, recipient: Types.ObjectId) {
    return this.conversationRepository.findOne({ creator, recipient });
  }

  async updateOne(
    _id: Types.ObjectId,
    payload: UpdateQuery<Partial<Conversation>>
  ) {
    return this.conversationRepository.findOneAndUpdate({ _id }, payload);
  }

  async readMessages(id: Types.ObjectId, recipient: Types.ObjectId) {
    return this.messagesRepository.findOneAndUpdate(
      { conversation: id, author: { $ne: recipient } },
      { unread: false }
    );
  }

  async unreadMessages(id: Types.ObjectId, role: string) {
    const conversations = await this.getConversations(id, role);

    let count = 0;

    conversations.map(async (conversation) => {
      const messages = await this.messagesRepository.count({
        conversation: conversation._id,
        author: { $ne: id },
        unread: false,
      });

      count += messages;
    });

    return count;
  }
}
