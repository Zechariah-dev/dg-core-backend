import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document, HydratedDocument, Types} from "mongoose";

export type ReviewDocumet = HydratedDocument<Review>;

@Schema({timestamps: true})
export class Review extends Document {
    @Prop({
        type: String,
    })
    content: string;

    @Prop({
        type: Number,
        min: 1,
        max: 5,
        required: true,
    })
    rating: number;

    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: "Product",
    })
    product: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: "User",
    })
    user: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: "User",
    })
    creator: Types.ObjectId
}

export const ReviewSchema = SchemaFactory.createForClass(Review).set(
    "versionKey",
    false
);
