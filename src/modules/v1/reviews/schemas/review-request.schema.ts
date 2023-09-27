import {Prop, SchemaFactory, Schema} from "@nestjs/mongoose";
import {HydratedDocument, Document} from "mongoose";
import {Types} from "mongoose";

@Schema({timestamps: true})
export class ReviewRequest extends Document {
    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: "Conversation",
    })
    conversation: Types.ObjectId;

    @Prop({
        type: [Types.ObjectId],
        required: true,
        ref: "Product",
    })
    products: Types.ObjectId[];

    @Prop({
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending",
        required: true
    })
    status: string;

    @Prop({
        type: Types.ObjectId,
        ref: "User"
    })
    creator: Types.ObjectId
}

export type ReviewRequestDocument = HydratedDocument<ReviewRequest>;

export const ReviewRequestSchema = SchemaFactory.createForClass(
    ReviewRequest
).set("versionKey", false);
