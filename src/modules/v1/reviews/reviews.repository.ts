import { BaseRepository } from "src/common/repositories/base.repository";
import { Review, ReviewDocumet } from "./schemas/review.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ReviewsRepository extends BaseRepository<ReviewDocumet> {
  constructor(
    @InjectModel(Review.name) private reviewsModel: Model<ReviewDocumet>
  ) {
    super(reviewsModel);
  }

  async productReviews(product: Types.ObjectId) {
    return this.reviewsModel.find({ product: product.toString() }).populate([
      {
        path: "user",
        select: "fullname image",
      },
      {
        path: "product",
        select: "title images",
      },
    ]);
  }

  async userReviews(user: Types.ObjectId) {
    return this.reviewsModel.find({ user }).populate({
      path: "product",
      select: "title images",
    });
  }

  async productAverageRating(product: string) {
    return this.reviewsModel.aggregate([
      {
        $match: {
          product,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
      {
        $project: {
          _id: 0,
          averageRating: 1,
        },
      },
    ]);
  }
}
