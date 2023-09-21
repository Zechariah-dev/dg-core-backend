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

  async creatorReviews(creator: Types.ObjectId) {
    return this.reviewsModel.find({ creator: creator.toString() }).populate([
      {
        path: "user",
        select: "fullname email image_id phone",
      },
      {
        path: "creator",
        select: "fullname email image _id phone",
      },
    ]);
  }

  async userReviews(user: Types.ObjectId) {
    return this.reviewsModel.find({ user }).populate({
      path: "creator",
      select: "fullname email image _id phone",
    });
  }

  async creatorAverageRating(creator: string) {
    return this.reviewsModel.aggregate([
      {
        $match: {
          creator,
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
