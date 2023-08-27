import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../../common/repositories/base.repository";
import { User, UserDocument } from "./schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, QueryOptions, UpdateQuery } from "mongoose";

@Injectable()
export class UsersRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel(User.name) private usersModel: Model<UserDocument>) {
    super(usersModel);
  }

  async findByUsername(username: string) {
    return this.usersModel.findOne({ username });
  }

  public findOne(
    query: FilterQuery<UserDocument>,
    projections?: unknown
  ): Promise<User> {
    return this.usersModel
      .findOne(query, projections)
      .populate([
        {
          path: "business",
          select: "-__v -createdAt -updatedAt",
        },
      ])
      .lean();
  }

  public find(
    query: FilterQuery<UserDocument>,
    projections?: unknown,
    options?: QueryOptions<unknown>
  ): Promise<UserDocument[]> {
    return this.usersModel
      .find(query, projections, options)
      .populate([
        {
          path: "business",
        },
      ])
      .lean();
  }

  public findOneAndUpdate(
    query: FilterQuery<UserDocument>,
    payload: UpdateQuery<Partial<UserDocument>>,
    options?: QueryOptions<unknown>
  ): Promise<UserDocument> {
    return this.usersModel
      .findOneAndUpdate(query, payload, {
        new: true,
        ...options,
      })
      .populate([
        {
          path: "business",
        },
      ])
      .lean();
  }
}
