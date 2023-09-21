import { Module } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Review, ReviewSchema } from "./schemas/review.schema";
import { ReviewsRepository } from "./reviews.repository";
import { UserSchema, User } from "../users/schemas/user.schema";
import { UsersRepository } from "../users/users.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Review.name,
        schema: ReviewSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository, UsersRepository],
})
export class ReviewsModule {}
