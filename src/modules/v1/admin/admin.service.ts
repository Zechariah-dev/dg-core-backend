import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../users/users.repository";
import { Types, UpdateQuery } from "mongoose";
import { APP_ROLES } from "../../../common/interfaces/auth.interface";
import { FetchUsersQueryDto } from "./dtos/query.dto";
import { User } from "../users/schemas/user.schema";
import { BusinessRepository } from "../business/business.repository";
import { ForumsRepository } from "../forums/forums.repository";
import { UpdateForumDto } from "./dtos/update-forum.dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly businessRepository: BusinessRepository,
    private readonly forumsRepository: ForumsRepository
  ) {}

  async approveCreatorAccount(_id: Types.ObjectId) {
    const user = await this.usersRepository.findOne({
      _id,
      role: APP_ROLES.CREATOR,
    });

    if (!user) {
      throw new NotFoundException("Creator account does not exist");
    }

    await this.businessRepository.findOneAndUpdate(
      { _id: user.business._id },
      { isApproved: true }
    );

    return user;
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

  async updateUserAccount(_id: Types.ObjectId, payload: UpdateQuery<User>) {
    return this.usersRepository.findOneAndUpdate({ _id }, payload);
  }

  async findForums(query: any) {
    const { page, limit, ...rest } = query;

    const parsedFilter = this.parseFilter(rest);

    return this.forumsRepository.find({ ...parsedFilter }, null, {
      page,
      skip: (page - 1) * limit,
    });
  }

  async approveForum(_id: Types.ObjectId, payload: UpdateForumDto) {
    return this.forumsRepository.findOneAndUpdate({ _id }, { ...payload });
  }

  private parseFilter(query: Partial<any>): object {
    const filter = {};

    if (query.category) {
      Object.assign(filter, { categories: { $in: [query.category] } });
    }

    if (query.search) {
      Object.assign(filter, { title: { $regex: query.search, $options: "i" } });
    }

    if (query.section) {
      Object.assign(filter, { sections: { $in: [query.section] } });
    }

    if (query.category) {
      Object.assign(filter, { category: query.category });
    }

    if (query.rating) {
      Object.assign(filter, { rating: { $gte: query.rating } });
    }

    if (query.role) {
      Object.assign(filter, { role: query.role });
    }

    if (query.approvalStatus) {
      Object.assign(filter, { approved: query.approvalStatus });
    }

    if (query.date) {
      const startDate = new Date(query.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(query.date);
      endDate.setHours(23, 59, 59, 59);

      Object.assign(filter, { createdAt: { $gte: startDate, $lte: endDate } });
    }

    return filter;
  }
}
