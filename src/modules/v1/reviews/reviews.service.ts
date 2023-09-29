import {UsersRepository} from "../users/users.repository";
import {ReviewRequestsRepository} from "./review-request.repository";
import {CreateReviewPayload} from "./reviews.interface";
import {ReviewsRepository} from "./reviews.repository";
import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {Types} from "mongoose";
import {ProductsRepository} from "../products/products.repository";

@Injectable()
export class ReviewsService {
    constructor(
        private readonly reviewsRepository: ReviewsRepository,
        private readonly usersRepository: UsersRepository,
        private readonly reviewRequestsRepository: ReviewRequestsRepository,
        private readonly  productsRepository: ProductsRepository
    ) {
    }

    async create(payload: CreateReviewPayload) {
        const product = await this.productsRepository.findOne({_id: payload.product})

        if (!product) {
            throw new BadRequestException("Product doesn't exist")
        }

        const review = await this.reviewsRepository.create({...payload, creator: product.seller});

        const rating = await this.reviewsRepository.creatorAverageRating(review.creator as unknown as string)

        if (rating.length > 0) {
            const averageRating = rating[0].averageRating

            // update product rating
            await this.usersRepository.findOneAndUpdate(
                {_id: review.creator},
                {rating: averageRating}
            );
        }


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
        reviews: Array<{ product: string; rating: number, comment: string }>
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
                    await this.reviewsRepository.findOneAndUpdate({_id: review._id}, {...r})
                } else {
                    await this.reviewsRepository.create({
                        user: userId,
                        product: r.product,
                        rating: r.rating,
                        content: r.comment || "",
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
