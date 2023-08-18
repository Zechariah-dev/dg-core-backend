import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../users/users.repository";
import { Types, UpdateQuery } from "mongoose";
import { APP_ROLES } from "../../../common/interfaces/auth.interface";
import { FetchUsersQueryDto } from "./dtos/query.dto";
import { User } from "../users/schemas/user.schema";

@Injectable()
export class AdminService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async approveCreatorAccount(_id: Types.ObjectId) {
    return this.usersRepository.findOneAndUpdate(
      { _id, role: APP_ROLES.CREATOR },
      { isApproved: true }
    );
  }

  async retrieveUsers(query: FetchUsersQueryDto) {
    const { page, limit, ...rest } = query;

    const parsedFilter = this.parseFilter(rest);

    return this.usersRepository.find({ ...parsedFilter }, null, {
      page,
      skip: (page - 1) * limit,
      sort: "-createdAt",
    });
  }

  async retrieveUser(_id: Types.ObjectId) {
    return this.usersRepository.findOne({ _id });
  }

  private parseFilter(query: Partial<FetchUsersQueryDto>) {
    const filter = {};

    if (query.role) {
      Object.assign(filter, { role: query.role });
    }

    return filter;
  }

  async updateUserAccount(_id: Types.ObjectId, payload: UpdateQuery<User>) {
    return this.usersRepository.findOneAndUpdate({ _id }, payload);
  }
}
