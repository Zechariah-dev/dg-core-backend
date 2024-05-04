import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConversationRepository } from "./conversation.repository";
import { Types, UpdateQuery } from "mongoose";
import { createConversationDto } from "./dtos/create-conversation.dto";
import { UsersRepository } from "../users/users.repository";
import { User } from "../users/schemas/user.schema";
import { MessagesRepository } from "../messages/messages.repository";
import { Conversation } from "./schemas/conversation.schema";
import { ObjectId } from "mongodb";
import { ReviewRequestsRepository } from "../reviews/review-request.repository";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly usersRepository: UsersRepository,
    private readonly messagesRepository: MessagesRepository,
    private readonly reviewRequestRepository: ReviewRequestsRepository,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
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

    aggregation.push({
      $sort: {
        lastMessageSentAt: -1,
      },
    });

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

  async create(creator: User, params: Omit<createConversationDto, "message">) {
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

    return await this.conversationRepository.create({
      creator: creator._id,
      recipient: recipient._id,
    });
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

    await Promise.all(
      conversations.map(async (conversation) => {
        const messages = (await this.messagesRepository.count({
          conversation: conversation._id,
          author: { $ne: id },
          unread: false,
        })) as number;

        count += messages;
      })
    );

    return count;
  }

  async requestConsumerReview(
    conversationId: Types.ObjectId,
    recipientId: Types.ObjectId
  ) {
    const conversationExist = (await this.conversationRepository.findOne({
      _id: conversationId,
    })) as any;

    console.log(conversationExist);

    if (!conversationExist) {
      throw new NotFoundException("Conversation does not exist");
    }

    let date: any = new Date();
    const sevenDaysAgo = date.setDate(date.getDate() - 7);
    date = new Date(sevenDaysAgo).setHours(0, 0, 0, 0);
    date = new Date(date);

    const conversationMessages = await this.messagesRepository.find({
      conversation: conversationId,
      createdAt: { $gte: date },
    });

    const products = conversationMessages.map(
      (message: any) => message?.product
    );

    const reviewRequest = await this.reviewRequestRepository.create({
      conversation: conversationId,
      products,
      creator: recipientId,
    });

    const appUrl = this.configService.getOrThrow("CLIENT_URL");

    const url = `${appUrl}/?reviewOpen=${true}&reviewId=${reviewRequest._id}`;

    const result = await this.mailerService.sendMail({
      to: conversationExist?.creator?.email,
      subject: "Quick: product review request",
      template: "review_request",
      context: {
        consumer: conversationExist?.creator?.fullname,
        creator: conversationExist?.recipient?.fullname,
        url,
      },
    });

    this.logger.log("Review request email result", result);

    return { message: "Review request sent successfully" };
  }
}
