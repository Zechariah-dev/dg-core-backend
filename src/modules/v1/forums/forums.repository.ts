import { BaseRepository } from "src/common/repositories/base.repository";
import { Forum, ForumDocument } from "./schema/forum.schema";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions } from "mongoose";

export class ForumsRepository extends BaseRepository<ForumDocument> {
  constructor(
    @InjectModel(Forum.name) private forumsModel: Model<ForumDocument>
  ) {
    super(forumsModel);
  }

  public async find(
    query: FilterQuery<ForumDocument>,
    projections?: unknown | null,
    options?: QueryOptions<unknown>
  ): Promise<ForumDocument[]> {
    return this.forumsModel.find(query, projections, options).populate([
      {
        path: "creator",
        select: "image fullname email phone _id",
      },
      {
        path: "comments.user",
        select: "image fullname email phone _id",
      },
    ]);
  }

  public findOne(query: FilterQuery<ForumDocument>, projections?: unknown) {
    return this.forumsModel.findOne(query, projections).populate([
      {
        path: "creator",
        select: "image fullname email phone _id",
      },
      {
        path: "comments.user",
        select: "image fullname email phone _id",
      },
    ]);
  }
}
