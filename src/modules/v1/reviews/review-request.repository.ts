import {BaseRepository} from "src/common/repositories/base.repository";
import {
    ReviewRequest,
    ReviewRequestDocument,
} from "./schemas/review-request.schema";
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model} from "mongoose";
import {Injectable} from "@nestjs/common";

@Injectable()
export class ReviewRequestsRepository extends BaseRepository<ReviewRequestDocument> {
    constructor(
        @InjectModel(ReviewRequest.name)
        private reviewRequestModel: Model<ReviewRequestDocument>
    ) {
        super(reviewRequestModel);
    }

    public  findOne(query: FilterQuery<ReviewRequestDocument>, projections?: any) {
        return this.reviewRequestModel.findOne(query, projections).populate([{
            path: "products"
        }])
    }
}
