import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, Document } from "mongoose";

@Schema({ timestamps: true })
export class Favorite extends Document {
  @Prop({ type: Types.ObjectId, ref: "Product" })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  user: Types.ObjectId;
}

export type FavoriteDocument = HydratedDocument<Favorite>;

export const FavoriteSchema = SchemaFactory.createForClass(Favorite).set(
  "versionKey",
  false
);
