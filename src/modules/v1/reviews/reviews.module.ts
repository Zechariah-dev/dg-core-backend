import { Module } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Review, ReviewSchema } from "./schemas/review.schema";
import { ReviewsRepository } from "./reviews.repository";
import { UserSchema, User } from "../users/schemas/user.schema";
import { UsersRepository } from "../users/users.repository";
import { ReviewRequestsRepository } from "./review-request.repository";
import {
  ReviewRequest,
  ReviewRequestSchema,
} from "./schemas/review-request.schema";

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
      {
        name: ReviewRequest.name,
        schema: ReviewRequestSchema,
      },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    ReviewsRepository,
    UsersRepository,
    ReviewRequestsRepository,
  ],
})
export class ReviewsModule {}
