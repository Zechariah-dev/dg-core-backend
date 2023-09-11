import { Injectable, Logger } from "@nestjs/common";
import { ForumsRepository } from "./forums.repository";
import { CreateForumDto } from "./dtos/create-forum.dto";
import { FilterQuery, Types, UpdateQuery } from "mongoose";
import { Forum } from "./schema/forum.schema";
import { FetchForumsQueryDto } from "./dtos/query.dto";
import { ObjectId } from "mongodb";

@Injectable()
export class ForumsService {
  private logger = new Logger(ForumsService.name);

  constructor(private readonly forumsRepository: ForumsRepository) {}

  async create(
    payload: CreateForumDto & { creator: Types.ObjectId; image: string }
  ) {
    const readTime = this.calculateReadingTime(payload.content);
    return this.forumsRepository.create({ ...payload, readTime });
  }

  async findById(_id: Types.ObjectId) {
    return this.forumsRepository.findOne({ _id });
  }

  async findOne(query: FilterQuery<Forum>) {
    return this.forumsRepository.findOne(query);
  }

  async delete(query: FilterQuery<Forum>) {
    return this.forumsRepository.findOneAndUpdate(query, {
      deletedAt: new Date(),
    });
  }

  async find(
    filter: FilterQuery<Forum>,
    projection: unknown | null,
    query: FetchForumsQueryDto
  ) {
    const { page, limit, ...rest } = query;

    const parsedFilter = this.parseFilter(rest);

    return this.forumsRepository.find(
      {
        ...filter,
        ...parsedFilter,
      },
      projection,
      {
        page,
        skip: (page - 1) * limit,
        sort: "-createdAt -updatedAt",
      }
    );
  }

  async update(
    query: FilterQuery<Forum>,
    payload: UpdateQuery<Partial<Forum>>
  ) {
    return this.forumsRepository.findOneAndUpdate(query, payload);
  }

  async findEngaged(userId: Types.ObjectId, query: FetchForumsQueryDto) {
    const { page, limit, ...rest } = query;

    const parsedFilter = this.parseFilter(rest);

    return this.forumsRepository.find(
      {
        approved: true,
        "comments.user": new ObjectId(userId),
        ...parsedFilter,
      },
      null,
      {
        page,
        skip: (page - 1) * limit,
      }
    );
  }

  async findPending(userId: Types.ObjectId, query: FetchForumsQueryDto) {
    const { page, limit, ...rest } = query;

    const parsedFilter = this.parseFilter(rest);

    return this.forumsRepository.find(
      { creator: userId, approved: false, ...parsedFilter },
      null,
      {
        page,
        skip: (page - 1) * limit,
      }
    );
  }

  calculateReadingTime(content: string) {
    const wpm = 225;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);

    return time;
  }

  private parseFilter(query: Partial<FetchForumsQueryDto>) {
    const filter = {};

    this.logger.log(query);

    return filter;
  }
}
