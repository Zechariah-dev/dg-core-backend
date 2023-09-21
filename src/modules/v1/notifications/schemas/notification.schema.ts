import { HydratedDocument, Document, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: "User" })
  user: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  body: string;

  @Prop({ type: String, required: false })
  link: string;

  @Prop({ type: Date, required: false })
  readAt: Date;

  @Prop({ type: Date, required: false })
  deletedAt: Date;
}

export type NotificationDocument = HydratedDocument<Notification>;

export const NotificationSchema = SchemaFactory.createForClass(
  Notification
).set("versionKey", false);
