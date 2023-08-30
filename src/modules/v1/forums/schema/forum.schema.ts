import { Types, Document, HydratedDocument } from "mongoose";
import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { APPROVAL_STATUS } from "../../../../constants";

@Schema({ timestamps: true })
export class Forum extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({ type: String, required: true })
  image: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: Number, required: true })
  readTime: number;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({
    type: String,
    enum: APPROVAL_STATUS,
    default: APPROVAL_STATUS.PENDING,
  })
  approvalStatus: string;

  @Prop({
    type: String,
    required: false,
  })
  approvalMessage: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: "User",
  })
  creator: Types.ObjectId;

  @Prop({
    type: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User",
        },
        content: String,
      },
    ],
  })
  comments: [
    {
      user: Types.ObjectId;
      content: string;
    }
  ];

  @Prop()
  deletedAt?: Date;
}

export type ForumDocument = HydratedDocument<Forum>;

export const ForumSchema = SchemaFactory.createForClass(Forum).set(
  "versionKey",
  false
);
