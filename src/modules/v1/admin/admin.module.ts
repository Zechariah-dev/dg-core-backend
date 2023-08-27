import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/schemas/user.schema";
import { UsersRepository } from "../users/users.repository";
import { BusinessRepository } from "../business/business.repository";
import { Business, BusinessSchema } from "../business/schemas/business.schema";
import { ForumsRepository } from "../forums/forums.repository";
import { Forum, ForumSchema } from "../forums/schema/forum.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Business.name,
        schema: BusinessSchema,
      },
      {
        name: Forum.name,
        schema: ForumSchema,
      },
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    UsersRepository,
    BusinessRepository,
    ForumsRepository,
  ],
})
export class AdminModule {}
