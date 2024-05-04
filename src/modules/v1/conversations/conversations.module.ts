import { Module } from "@nestjs/common";
import { ConversationsService } from "./conversations.service";
import { ConversationsController } from "./conversations.controller";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Conversation,
  ConversationSchema,
} from "./schemas/conversation.schema";
import { ConversationRepository } from "./conversation.repository";
import { MessagesRepository } from "../messages/messages.repository";
import { UsersRepository } from "../users/users.repository";
import { Message, MessageSchema } from "../messages/schemas/message.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { ReviewRequestsRepository } from "../reviews/review-request.repository";
import {
  ReviewRequest,
  ReviewRequestSchema,
} from "../reviews/schemas/review-request.schema";
import { MessagesService } from "../messages/messages.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
      {
        name: Message.name,
        schema: MessageSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: ReviewRequest.name,
        schema: ReviewRequestSchema,
      },
    ]),
  ],
  controllers: [ConversationsController],
  providers: [
    ConversationsService,
    ConversationRepository,
    MessagesRepository,
    UsersRepository,
    ReviewRequestsRepository,
    MessagesService,
  ],
  exports: [ConversationsService],
})
export class ConversationsModule {}
