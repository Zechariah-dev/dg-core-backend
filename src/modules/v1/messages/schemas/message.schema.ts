import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: "User" })
  author: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Conversation" })
  conversation: Types.ObjectId;
}

export type MessageDocument = HydratedDocument<Message>;

export const MessageSchema = SchemaFactory.createForClass(Message).set(
  "versionKey",
  false
);
