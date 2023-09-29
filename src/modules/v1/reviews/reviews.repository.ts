import {BaseRepository} from "src/common/repositories/base.repository";
import {Review, ReviewDocumet} from "./schemas/review.schema";
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, QueryOptions} from "mongoose";
import {Injectable} from "@nestjs/common";
import {Types} from "mongoose";
import {query} from "express";

@Injectable()
export class ReviewsRepository extends BaseRepository<ReviewDocumet> {
    constructor(
        @InjectModel(Review.name) private reviewsModel: Model<ReviewDocumet>
    ) {
        super(reviewsModel);
    }

    async creatorReviews(creator: Types.ObjectId) {
        return this.reviewsModel.find({creator: creator.toString()}).populate([
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

    public async find(query: FilterQuery<ReviewDocumet>, projections?: any, options?: QueryOptions): Promise<ReviewDocumet[]> {
        return this.reviewsModel.find(query, projections, options).populate([{
            path: "user",
            select: "fullname email image_id phone",
        },
            {
                select: "fullname email image _id phone",
                path: "creator",
            }]);
    }

    async userReviews(user: Types.ObjectId) {
        return this.reviewsModel.find({user}).populate({
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
                    averageRating: {$avg: "$rating"},
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
