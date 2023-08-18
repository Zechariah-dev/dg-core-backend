import { ProductsRepository } from "./../products/products.repository";
import { CreateReviewPayload } from "./reviews.interface";
import { ReviewsRepository } from "./reviews.repository";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly productRepository: ProductsRepository
  ) {}

  async create(payload: CreateReviewPayload) {
    const review = await this.reviewsRepository.create(payload);

    const averageRating = await this.reviewsRepository.productAverageRating(
      review.product
    );

    // update product rating
    await this.productRepository.findOneAndUpdate(
      { _id: review.product },
      { rating: averageRating[0].averageRating }
    );

    return review;
  }

  async fetchProductReviews(product: Types.ObjectId) {
    return this.reviewsRepository.productReviews(product);
  }

  async fethUserReviews(user: Types.ObjectId) {
    return this.reviewsRepository.userReviews(user);
  }

  async delete(_id: Types.ObjectId) {
    return this.reviewsRepository.deleteOne({ _id });
  }
}
