import { Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { User } from "./schemas/user.schema";
import { FilterQuery, Types } from "mongoose";
import { UserRegisterDto } from "../auth/dtos/user-register.dto";
import { BusinessRepository } from "../business/business.repository";
import { ConversationRepository } from "../conversations/conversation.repository";
import { ProductsRepository } from "../products/products.repository";
import { APP_ROLES } from "../../../common/interfaces/auth.interface";
import { SettingsRepository } from "src/common/repositories/setting.repository";
import { UpdateUserSettingDto } from "./dtos/update-user-setting.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly businessRepository: BusinessRepository,
    private readonly configService: ConfigService,
    private readonly conversationRepository: ConversationRepository,
    private readonly productRepository: ProductsRepository,
    private readonly settingsRepository: SettingsRepository
  ) { }

  async findByEmail(email: string): Promise<any> {
    return this.usersRepository.findOne({ email });
  }

  async findById(_id: Types.ObjectId): Promise<User | null> {
    return await this.usersRepository.findOne({ _id });
  }

  async findOne(query: FilterQuery<User>) {
    return this.usersRepository.findOne(query);
  }

  async create(payload: UserRegisterDto): Promise<User> {
    const saltRounds = Number(this.configService.get<number>("SALT_ROUND"));
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    let user = await this.usersRepository.create({
      ...payload,
      password: hashedPassword,
    });

    if (payload.role === APP_ROLES.CREATOR) {
      const business = await this.businessRepository.create({});

      business.creator = user._id;
      await business.save();

      user.business = business._id;
    }

    const setting = await this.settingsRepository.create({
      user: user._id,
      notification: {
        email: false,
        pushNotification: true,
      },
    });
    user.setting = setting._id;
    user = await user.save();

    return user;
  }

  async updateProfile(
    query: FilterQuery<User>,
    payload: Partial<User>
  ): Promise<User | null> {
    return this.usersRepository.findOneAndUpdate(query, payload);
  }

  async isUsernameAvailable(
    userId: Types.ObjectId,
    username: string
  ): Promise<boolean> {
    const user = await this.usersRepository.findByUsername(username);

    // If no user with the given username is found, it is available
    if (!user) {
      return true;
    }

    // If the found user has the same user ID, it is the current user's username
    if (user._id.toString() === userId.toString()) {
      return true;
    }

    // Otherwise, the username is taken by another user
    return false;
  }

  async updatePassword(userId: Types.ObjectId, password: string) {
    const saltRounds = Number(this.configService.get<number>("SALT_ROUND"));
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    return this.usersRepository.findOneAndUpdate(
      { _id: userId },
      { password: hashedPassword }
    );
  }

  async createOauthUser(payload: any) {
    return this.usersRepository.create({
      fullName: payload.fullName,
      email: payload.email,
      image: payload.image,
      isVerified: true,
      oauthCredentials: {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
      },
    });
  }

  async getInsights(userId: Types.ObjectId) {
    const conversationInsight = await this.conversationRepository.getInsight(
      userId
    );

    const products = await this.productRepository.find({ seller: userId });

    const viewsCount = products.reduce(
      (accumulator, product) => accumulator + product.views,
      0
    );

    return { conversationInsight: conversationInsight[0], viewsCount };
  }

  async updateSetting(user: Types.ObjectId, payload: UpdateUserSettingDto) {
    return await this.settingsRepository.findOneAndUpdate(
      { user },
      { ...payload }
    );
  }

  async getCreatorProfile(_id: Types.ObjectId) {
    const profile = await this.usersRepository.findOne({ _id });
    const products = await this.productRepository.find({ seller: _id })

    return { profile, products }
  }
}
