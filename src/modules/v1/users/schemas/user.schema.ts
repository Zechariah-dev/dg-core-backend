import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { APP_ROLES } from "../../../..//common/interfaces/auth.interface";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String })
  fullname: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: String })
  coverImage: string;

  @Prop({ type: String })
  idDocumentType: string;

  @Prop({ type: String })
  idDocumentFile: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String, required: true, enum: APP_ROLES })
  role: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  state: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  gender: string;

  @Prop({ type: [String] })
  languages: string[];

  @Prop({ type: String })
  bio: string;

  @Prop({ type: String })
  businessTag: string;

  @Prop({ type: String })
  username: string;

  @Prop({ type: Boolean })
  termsAndCondition: boolean;

 

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: Boolean, default: false })
  isApproved: boolean;

  // Allow admin disable user account
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: "Business" })
  business: Types.ObjectId;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User).set(
  "versionKey",
  false
);
