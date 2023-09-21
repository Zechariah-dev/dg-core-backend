import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, Document } from "mongoose";

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
  })
  sku: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: [Types.ObjectId],
    ref: "Category",
  })
  categories: Types.ObjectId[];

  @Prop({
    required: false,
    type: [String],
  })
  images: string[];

  @Prop({
    type: Number,
  })
  price: number;

  @Prop({
    type: Number,
  })
  quantity: number;

  @Prop({
    type: String,
    enum: ["product", "service"],
  })
  type: string;

  @Prop({
    type: [String],
    maxlength: 10,
  })
  tags: string[];

  @Prop({
    required: false,
    type: [
      {
        size: {
          type: String,
          required: false,
        },
        color: {
          type: String,
          required: false,
        },
        price: Number,
        quantity: Number,
        isVisible: Boolean,
      },
    ],
  })
  variation: {
    size: string;create
    color: string;
    price: number;
    quantity: number;
    isVisible: boolean;
  }[];

  @Prop({
    required: false,
    type: [
      {
        name: String,
        role: String,
      },
    ],
  })
  collaborationPartners: { name: string; role: string }[];

  @Prop({
    type: [String],
    required: false,
  })
  sections: string[];

  @Prop({
    required: false,
    type: {
      instruction: String,
      isOptional: Boolean,
    },
  })
  personalization: {
    instruction: string;
    IsOptional: boolean;
  };

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  seller: Types.ObjectId;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Types.ObjectId, ref: "Store", required: false })
  store: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product).set(
  "versionKey",
  false
);
