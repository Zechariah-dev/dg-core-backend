import { Injectable, Logger } from "@nestjs/common";
import { ForumsRepository } from "./forums.repository";
import { CreateForumDto } from "./dtos/create-forum.dto";
import { FilterQuery, Types, UpdateQuery } from "mongoose";
import { Forum } from "./schema/forum.schema";
import { FetchForumsQueryDto } from "./dtos/query.dto";

@Injectable()
export class ForumsService {
  private logger = new Logger(ForumsService.name);

  constructor(private readonly forumsRepository: ForumsRepository) {}

  async create(payload: CreateForumDto & { creator: Types.ObjectId, image: string }) {
    return this.forumsRepository.create(payload);
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
      }
    );
  }

  async update(
    query: FilterQuery<Forum>,
    payload: UpdateQuery<Partial<Forum>>
  ) {
    return this.forumsRepository.findOneAndUpdate(query, payload);
  }

  private parseFilter(query: Partial<FetchForumsQueryDto>) {
    const filter = {};

    this.logger.log(query);

    return filter;
  }
}
