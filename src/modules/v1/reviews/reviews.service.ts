import { UsersRepository } from "../users/users.repository";
import { CreateReviewPayload } from "./reviews.interface";
import { ReviewsRepository } from "./reviews.repository";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  async create(payload: CreateReviewPayload) {
    const review = await this.reviewsRepository.create(payload);

    const averageRating = await this.reviewsRepository.creatorAverageRating(
      review.creator
    );

    // update product rating
    await this.usersRepository.findOneAndUpdate(
      { _id: review.creator },
      { rating: averageRating[0].averageRating }
    );

    return review;
  }

  async fetchCreatorReviews(creator: Types.ObjectId) {
    return this.reviewsRepository.creatorReviews(creator);
  }

  async fethUserReviews(user: Types.ObjectId) {
    return this.reviewsRepository.userReviews(user);
  }

  async delete(_id: Types.ObjectId) {
    return this.reviewsRepository.deleteOne({ _id });
  }
}
