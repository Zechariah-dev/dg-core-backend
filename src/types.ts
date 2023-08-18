import { Request } from "express";
import { User } from "./modules/v1/users/schemas/user.schema";
import { Conversation } from "./modules/v1/conversations/schemas/conversation.schema";
import { Message } from "./modules/v1/messages/schemas/message.schema";

declare global {
  interface AuthRequest extends Request {
    user: User;
  }
}

export type CreateMessageResponse = {
  message: Message;
  conversation: Conversation;
};
