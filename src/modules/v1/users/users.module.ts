import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { AwsS3Service } from "../../../common/services/aws-s3.service";
import { Business, BusinessSchema } from "../business/schemas/business.schema";
import { BusinessRepository } from "../business/business.repository";

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
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, AwsS3Service, BusinessRepository],
})
export class UsersModule {}
