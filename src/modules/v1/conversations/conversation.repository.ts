import { BaseRepository } from "src/common/repositories/base.repository";
import {
  Conversation,
  ConversationDocument,
} from "./schemas/conversation.schema";
import { InjectModel } from "@nestjs/mongoose";
import {
  Document,
  FilterQuery,
  Model,
  QueryOptions,
  Types,
  UpdateQuery,
} from "mongoose";

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
        {
          path: "lastMessageSent",
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
      .sort("lastMessageSentAt")
      .populate([
        {
          path: "creator",
          select: "image fullname phone _id email",
        },
        {
          path: "recipient",
          select: "image fullname phone _id email",
        },
        {
          path: "lastMessageSent",
        },
      ])
      .lean();
  }

  public async findOneAndUpdate(
    query: FilterQuery<ConversationDocument>,
    payload: UpdateQuery<ConversationDocument>,
    options?: QueryOptions<unknown>
  ): Promise<ConversationDocument> {
    return this.conversationModel
      .findOneAndUpdate(query, payload, {
        new: true,
        ...options,
      })
      .populate([
        {
          path: "creator",
          select: "image fullname phone _id email",
        },
        {
          path: "recipient",
          select: "image fullname phone _id email",
        },
        {
          path: "lastMessageSent",
        },
      ])
      .lean();
  }

  async getInsight(userId: Types.ObjectId) {
    return this.conversationModel.aggregate([
      {
        $match: {
          $or: [
            {
              creator: userId,
            },
            {
              recipient: userId,
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: null,
          totalCount: {
            $sum: 1,
          },
          latestDate: {
            $first: "$createdAt",
          },
          sevenDaysAgoDate: {
            $first: {
              $dateFromParts: {
                year: {
                  $year: "$createdAt",
                },
                month: {
                  $month: "$createdAt",
                },
                day: {
                  $dayOfMonth: {
                    $subtract: ["$createdAt", 7 * 24 * 60 * 60 * 1000],
                  },
                },
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
              },
            },
          },
        },
      },
      {
        $project: {
          totalCount: 1,
          percentageChange: {
            $cond: {
              if: {
                $eq: ["$sevenDaysAgoDate", null],
              },
              then: null,
              else: {
                $divide: [
                  {
                    $subtract: [
                      "$totalCount",
                      {
                        $arrayElemAt: ["$previousTotalCount", 0],
                      },
                    ],
                  },
                  {
                    $arrayElemAt: ["$previousTotalCount", 0],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalCount: 1,
          percentageChange: 1,
        },
      },
    ]);
  }
}
