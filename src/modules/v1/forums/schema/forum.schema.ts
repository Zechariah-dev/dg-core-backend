import { Types, Document, HydratedDocument } from "mongoose";
import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";

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

  @Prop({ type: String, required: true })
  readTime: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Boolean, default: false })
  approved: boolean;

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
