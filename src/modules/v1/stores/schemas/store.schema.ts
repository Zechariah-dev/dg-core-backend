import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Store extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  name: string;

  @Prop({ type: String, requried: false })
  bio: string;

  @Prop({
    type: [Types.ObjectId],
    ref: "Category",
  })
  categories: Types.ObjectId[];

  @Prop({ type: String, required: false, unique: true, index: true })
  creatorTag: string;

  @Prop({
    type: [String],
    required: false,
  })
  languages: string[];

  @Prop({ type: Types.ObjectId, ref: "User" })
  creator: Types.ObjectId;

  @Prop({ type: Date, required: false })
  deletedAt: Date;
}

export type StoreDocument = HydratedDocument<Store>;

export const StoreSchema = SchemaFactory.createForClass(Store).set(
  "versionKey",
  false
);
