import {UsersRepository} from "../users/users.repository";
import {ReviewRequestsRepository} from "./review-request.repository";
import {CreateReviewPayload} from "./reviews.interface";
import {ReviewsRepository} from "./reviews.repository";
import {Injectable, NotFoundException} from "@nestjs/common";
import {Types} from "mongoose";

@Injectable()
export class ReviewsService {
    constructor(
        private readonly reviewsRepository: ReviewsRepository,
        private readonly usersRepository: UsersRepository,
        private readonly reviewRequestsRepository: ReviewRequestsRepository
    ) {
    }

    async create(payload: CreateReviewPayload) {
        const review = await this.reviewsRepository.create(payload);

        const averageRating = await this.reviewsRepository.creatorAverageRating(
            review.creator
        );

        // update product rating
        await this.usersRepository.findOneAndUpdate(
            {_id: review.creator},
            {rating: averageRating[0].averageRating}
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
        return this.reviewsRepository.deleteOne({_id});
    }

    async getReviewRequest(_id: Types.ObjectId) {
        const reviewRequest = await this.reviewRequestsRepository.findOne({_id});

        if (!reviewRequest) {
            throw new NotFoundException("Review Request doesn't exist");
        }

        return {reviewRequest, message: "Review Request fetched successfully"};
    }

    async submitReviewRequest(
        userId: Types.ObjectId,
        requestId: Types.ObjectId,
        reviews: Array<{ product: string; rating: number }>
    ) {
        const reviewRequest = await this.reviewRequestsRepository.findOne({_id: requestId})

        if (!reviewRequest) {
            throw new NotFoundException("Review request doesn't exist")
        }
        await Promise.all(
            reviews.map(async (r) => {
                let review = await this.reviewsRepository.findOne({
                    user: userId,
                    product: r.product,
                    creator: reviewRequest.creator
                });

                if (review) {
                    review = await this.reviewsRepository.findOneAndUpdate({_id: review._id}, {rating: r.rating})
                } else {
                    review = await this.reviewsRepository.create({
                        user: userId,
                        product: r.product,
                        rating: r.rating,
                        content: "",
                        creator: reviewRequest.creator
                    });
                }

            })
        );

        const rating = await this.reviewsRepository.creatorAverageRating(reviewRequest.creator as unknown as string)
        const averageRating = rating[0].averageRating

        await this.usersRepository.findOneAndUpdate({_id: reviewRequest.creator}, {rating: averageRating})

        return {message: "Reviews submitted successfully"}
    }
}
