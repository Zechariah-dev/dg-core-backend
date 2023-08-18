import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Category {
  @Prop({
    required: true,
    type: String,
    index: true,
  })
  name: string = "";

  @Prop({
    required: true,
    type: String,
  })
  description: string = "";

  @Prop({
    type: String,
  })
  image: string = "";

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export type CategoryDocument = Category & Document;

export const CategorySchema = SchemaFactory.createForClass(Category).set(
  "versionKey",
  false
);

CategorySchema.index({ name: "text" });
