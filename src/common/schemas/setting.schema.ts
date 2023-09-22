import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Setting extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
  })
  user: Types.ObjectId;

  @Prop({
    type: {
      email: {
        type: Boolean,
        default: false,
      },
      pushNotification: {
        type: Boolean,
        default: true,
      },
    },
  })
  notification: {
    email: boolean;
    pushNotification: boolean;
  };
}

export type SettingDocument = HydratedDocument<Setting>;

export const SettingSchema = SchemaFactory.createForClass(Setting).set(
  "versionKey",
  false
);
