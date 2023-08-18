import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Business extends Document {
  @Prop({ type: Types.ObjectId, ref: "User" })
  creator: Types.ObjectId;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  cacNumber: string;

  @Prop({ type: String })
  cacDocument: string;
}

export type BusinessDocument = HydratedDocument<Business>;

export const BusinessSchema = SchemaFactory.createForClass(Business).set(
  "versionKey",
  false
);
