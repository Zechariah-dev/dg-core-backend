import { Types } from "mongoose";

export type CreateMessageParams = {
  conversation: Types.ObjectId;
  content: string;
  author: Types.ObjectId;
  product?: Types.ObjectId;
};
