import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument, Types, Document } from "mongoose";

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: Types.ObjectId, ref: "User" })
  creator: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  recipient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Message" })
  lastMessageSent: Types.ObjectId;

  @Prop({ type: Date })
  lastMessageSentAt: Date;
}

export type ConversationDocument = HydratedDocument<Conversation>;

export const ConversationSchema = SchemaFactory.createForClass(
  Conversation
).set("versionKey", false);
